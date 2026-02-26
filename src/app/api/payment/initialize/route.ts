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
        const { user, event, amount, basketId } = body;

        if (!user?.uid || !event?.id || !amount || !basketId) {
            return NextResponse.json({ status: 'failure', errorMessage: 'Missing required parameters' }, { status: 400 });
        }

        // 2. Server-Side Price Validation (Optional but highly recommended)
        // Note: For complete security, we should re-calculate discounts and seat prices here.
        // For now, we will just fetch the event to ensure it exists.
        const eventDocRef = doc(db, 'events', event.id);
        const eventSnap = await getDoc(eventDocRef);

        if (!eventSnap.exists()) {
            return NextResponse.json({ status: 'failure', errorMessage: 'Event not found' }, { status: 404 });
        }

        // Convert amount to kuruş
        const amountInKurus = Math.round(Number(amount) * 100);

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
