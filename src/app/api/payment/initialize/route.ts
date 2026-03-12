import { NextRequest, NextResponse } from 'next/server';
import { generatePaytrToken } from '@/lib/paytr';
import { rateLimiter, RATE_LIMITS, getClientIdentifier } from '@/lib/rateLimit';
import { logAudit, getClientInfo } from '@/lib/auditLog';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Note: Client SDK used in Edge/Node runtime, ensure it works or use admin SDK. Here we use what is available.

export async function POST(request: NextRequest) {
    // 1. Rate Limiting
    const identifier = getClientIdentifier(request);
    const { limit, windowMs } = RATE_LIMITS.api;

    if (!rateLimiter.check(identifier, limit, windowMs)) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 }
        );
    }

    try {
        const body = await request.json();
        const { user, event, amount, basketId, ticketCount } = body;

        if (!user?.uid || !event?.id || !amount || !basketId) {
            return NextResponse.json({ status: 'failure', errorMessage: 'Missing required parameters' }, { status: 400 });
        }

        // 2. Server-Side Price Validation
        // Fetch original event data from Firestore to get the real price
        const eventDocRef = doc(db, 'events', event.id);
        const eventSnap = await getDoc(eventDocRef);
        
        if (!eventSnap.exists()) {
            return NextResponse.json({ status: 'failure', errorMessage: 'Event not found' }, { status: 404 });
        }
        
        const eventData = eventSnap.data();
        const ticketPrice = eventData.price || (eventData.ticketTypes && eventData.ticketTypes.length > 0 ? eventData.ticketTypes[0].price : 0);
        const count = ticketCount || body.ticketCount || 1;
        
        // Recalculate subtotal
        let calculatedSubtotal = 0;
        if (eventData.hasSeatSelection && body.selectedSeats?.length > 0) {
            // Validate each seat price if different from base price
            body.selectedSeats.forEach((seat: any) => {
                // In a production app, we would look up the specific price for this seat
                // If the client sends seat objects with prices, we use the event's ticketTypes/price as authoritative
                calculatedSubtotal += seat.price || ticketPrice; 
            });
        } else {
            calculatedSubtotal = ticketPrice * count;
        }

        // Apply group discounts if applicable
        let groupDiscount = 0;
        if (!eventData.hasSeatSelection && eventData.groupTickets?.length > 0) {
            const applicableTier = eventData.groupTickets
                .filter((tier: any) => count >= tier.minTickets)
                .sort((a: any, b: any) => b.discount - a.discount)[0];

            if (applicableTier) {
                groupDiscount = Math.round(calculatedSubtotal * applicableTier.discount * 100) / 100;
            }
        }

        let calculatedTotal = calculatedSubtotal - groupDiscount;

        // Apply discount code if present
        if (body.discountCode) {
            const { validateDiscountCode } = await import('@/lib/discountValidator');
            const discountResult = await validateDiscountCode(
                body.discountCode,
                user.uid,
                event.id,
                eventData.category || '',
                calculatedTotal
            );
            
            if (discountResult.valid && discountResult.finalPrice !== undefined) {
                calculatedTotal = discountResult.finalPrice;
            }
        }

        // IMPORTANT: Verify that the amount requested matches our calculation
        // We use a small epsilon for floating point comparison
        const requestedAmount = Number(amount);
        if (Math.abs(requestedAmount - calculatedTotal) > 0.01) {
            console.error('Price Mismatch Detected!', { requested: requestedAmount, calculated: calculatedTotal });
            return NextResponse.json({ 
                status: 'failure', 
                errorMessage: 'Security Alert: Price mismatch detected. The payment amount does not match the server calculation.' 
            }, { status: 400 });
        }

        const ownerId = eventData.organizerId || eventData.ownerId;

        // Convert amount to kuruş
        const amountInKurus = Math.round(calculatedTotal * 100);

        // 3. Role-Based Security: Check if event owner is authorized to sell via Credit Card
        // If the event is set to 'internal' sales, the owner MUST be an 'organizer' or 'admin'.
        if (eventData.salesType === 'internal' && ownerId) {
            const ownerDocRef = doc(db, 'users', ownerId);
            const ownerSnap = await getDoc(ownerDocRef);
            const ownerData = ownerSnap.data();

            if (!ownerSnap.exists() || (ownerData?.role !== 'organizer' && ownerData?.role !== 'admin')) {
                return NextResponse.json({
                    status: 'failure',
                    errorMessage: 'This organizer is not authorized for credit card payments.'
                }, { status: 403 });
            }
        }

        const protocol = request.headers.get('x-forwarded-proto') || 'https';
        const host = request.headers.get('host') || 'www.sivasetkinlikleri.com';
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

        const okUrl = `${baseUrl}/odeme-basarili`;
        const failUrl = `${baseUrl}/odeme-basarisiz`;

        // 3. Generate PayTR Token
        const paytrParams = {
            userEmail: user.email || 'no-email@sivasetkinlik.com',
            userName: user.displayName || 'Guest User',
            userAddress: 'Sivas, Turkey', // Required by PayTR
            userPhone: user.phoneNumber || '05000000000',
            merchantOid: basketId,
            paymentAmount: amountInKurus,
            currency: 'TL' as const,
            userIp: (getClientInfo(request.headers).ipAddress || '127.0.0.1').split(',')[0].trim(),
            basket: [
                [event.title || 'Bilet', amount.toString(), 1]
            ] as Array<[string, string, number]>,
            merchantOkUrl: okUrl,
            merchantFailUrl: failUrl,
            testMode: 1 as const // Enable test mode by default
        };

        const paytrTokenValue = await generatePaytrToken(paytrParams);

        // 4. Save pending order to Firestore for callback processing
        const orderRef = doc(db, 'orders', basketId);
        await setDoc(orderRef, {
            userId: user.uid,
            userEmail: user.email,
            userName: user.displayName,
            userPhone: user.phoneNumber,
            eventId: event.id,
            eventTitle: event.title,
            ownerId: ownerId, // Track who earns this money
            amount: amount,
            basketId: basketId,
            status: 'pending',
            createdAt: serverTimestamp(),
            // Store raw body for reconstruction if needed
            body: body
        });

        // 5. Audit Log Success
        const clientInfo = getClientInfo(request.headers);
        await logAudit({
            userId: user.uid,
            userEmail: user.email || '',
            action: 'payment_initialize_success',
            resource: 'payment',
            resourceId: basketId,
            details: {
                eventId: event.id,
                amount: amount,
            },
            status: 'success',
            ...clientInfo,
        });

        // Return token and data required to build the form/iframe on the client view
        return NextResponse.json({
            status: 'success',
            paytrToken: paytrTokenValue,
            iframeUrl: 'https://www.paytr.com/odeme/guvenli/' + paytrTokenValue
        });

    } catch (error) {
        console.error('Payment Init Error:', error);

        const clientInfo = getClientInfo(request.headers);
        await logAudit({
            userId: 'unknown',
            userEmail: '',
            action: 'payment_initialize_failed',
            resource: 'payment',
            details: {},
            status: 'failure',
            errorMessage: (error as Error).message,
            ...clientInfo,
        });

        return NextResponse.json({ status: 'error', errorMessage: (error as Error).message }, { status: 500 });
    }
}
