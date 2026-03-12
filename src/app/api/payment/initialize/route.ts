import { NextRequest, NextResponse } from 'next/server';
import { generatePaytrToken } from '@/lib/paytr';
import { rateLimiter, RATE_LIMITS, getClientIdentifier } from '@/lib/rateLimit';
import { logAudit, getClientInfo } from '@/lib/auditLog';
import { adminDb } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';

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
        const eventSnap = await adminDb.collection('events').doc(event.id).get();
        
        if (!eventSnap.exists) {
            return NextResponse.json({ status: 'failure', errorMessage: 'Event not found' }, { status: 404 });
        }
        
        const eventData = eventSnap.data() || {};
        
        // Define authoritative price picking logic (should match client)
        const ticketPrice = (eventData.ticketTypes && eventData.ticketTypes.length > 0)
            ? eventData.ticketTypes[0].price
            : (eventData.price || 0);
        const count = ticketCount || body.ticketCount || 1;
        
        // Recalculate subtotal
        let calculatedSubtotal = 0;
        if (eventData.hasSeatSelection && body.selectedSeats?.length > 0) {
            // Validate each seat price if different from base price
            body.selectedSeats.forEach((seat: any) => {
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
        const requestedAmount = Number(amount);
        const diff = Math.abs(requestedAmount - calculatedTotal);
        
        if (diff > 0.01) {
            console.error('Price Mismatch Detected!', { 
                requested: requestedAmount, 
                calculated: calculatedTotal,
                diff: diff,
                details: {
                    basePrice: ticketPrice,
                    count: count,
                    groupDisc: groupDiscount,
                    hasSeats: eventData.hasSeatSelection
                }
            });
            return NextResponse.json({ 
                status: 'failure', 
                errorMessage: `Güvenlik Uyarısı: Fiyat eşleşmedi. (R:${requestedAmount} vs C:${calculatedTotal})`
            }, { status: 400 });
        }

        const ownerId = eventData.organizerId || eventData.ownerId || 'admin';

        // Convert amount to kuruş
        const amountInKurus = Math.round(calculatedTotal * 100);

        // 3. Role-Based Security: Check if event owner is authorized to sell via Credit Card
        // Bypass check for system events (ownerId === 'admin')
        if (eventData.salesType === 'internal' && ownerId && ownerId !== 'admin') {
            const ownerSnap = await adminDb.collection('users').doc(ownerId).get();
            const ownerData = ownerSnap.data();

            if (!ownerSnap.exists || (ownerData?.role !== 'organizer' && ownerData?.role !== 'admin')) {
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
        await adminDb.collection('orders').doc(basketId).set({
            userId: user.uid,
            userEmail: user.email || null,
            userName: user.displayName || null,
            userPhone: user.phoneNumber || null,
            eventId: event.id,
            eventTitle: event.title,
            ownerId: ownerId, // Track who earns this money
            amount: amount,
            vatRate: eventData.vatRate || 10,
            taxBase: Math.round((calculatedTotal / (1 + (eventData.vatRate || 10) / 100)) * 100) / 100,
            vatAmount: Math.round((calculatedTotal - (calculatedTotal / (1 + (eventData.vatRate || 10) / 100))) * 100) / 100,
            basketId: basketId,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
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
