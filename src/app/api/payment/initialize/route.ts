import { NextResponse } from 'next/server';
import { initializePayment } from '@/lib/iyzico';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { user, event, amount, basketId } = body;

        // Construct Iyzico Request Object (Mocking necessary fields)
        const paymentRequest: any = {
            price: amount,
            paidPrice: amount,
            currency: 'TRY',
            basketId: basketId,
            paymentGroup: 'PRODUCT',
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`,
            buyer: {
                id: user.uid,
                name: user.displayName || 'Guest',
                surname: 'User',
                gsmNumber: user.phoneNumber || '+905000000000',
                email: user.email,
                identityNumber: '11111111111',
                registrationAddress: 'N/A',
                ip: '127.0.0.1',
                city: 'Sivas',
                country: 'Turkey',
            },
            billingAddress: {
                contactName: user.displayName || 'Guest',
                city: 'Sivas',
                country: 'Turkey',
                address: 'N/A',
            },
            basketItems: [
                {
                    id: event.id,
                    name: event.title,
                    category1: 'Etkinlik',
                    price: amount,
                    itemType: 'VIRTUAL',
                },
            ],
        };

        const result = await initializePayment(paymentRequest);

        if (result.status === 'success') {
            return NextResponse.json({ status: 'success', paymentId: result.paymentId });
        } else {
            return NextResponse.json({ status: 'failure', errorMessage: result.errorMessage }, { status: 400 });
        }

    } catch (error) {
        console.error('Payment Init Error:', error);
        return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
    }
}
