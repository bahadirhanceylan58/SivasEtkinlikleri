import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
    try {
        // PayTR sends data as application/x-www-form-urlencoded
        const formData = await request.formData();

        const merchant_oid = formData.get('merchant_oid') as string;
        const status = formData.get('status') as string;
        const total_amount = formData.get('total_amount') as string;
        const hash = formData.get('hash') as string;
        const failed_reason_code = formData.get('failed_reason_code') as string;
        const failed_reason_msg = formData.get('failed_reason_msg') as string;
        const test_mode = formData.get('test_mode') as string;
        const payment_type = formData.get('payment_type') as string;
        const currency = formData.get('currency') as string;
        const payment_amount = formData.get('payment_amount') as string;

        const merchantKey = process.env.PAYTR_MERCHANT_KEY;
        const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

        if (!merchantKey || !merchantSalt) {
            console.error('PayTR credentials missing in environment.');
            return NextResponse.json({ status: 'error' }, { status: 500 });
        }

        // Generate hash to verify PayTR signature
        const hashStr = `${merchant_oid}${merchantSalt}${status}${total_amount}`;
        const generatedHash = crypto
            .createHmac('sha256', merchantKey)
            .update(hashStr)
            .digest('base64');

        if (hash !== generatedHash) {
            console.error('PayTR Callback Hash Mismatch!', { merchant_oid });
            return new NextResponse('PAYTR hash mismatch', { status: 400 });
        }

        if (status === 'success') {
            // Find the reservation in Firestore by merchant_oid (basketId / qrCode)
            console.log(`Payment successful for order: ${merchant_oid}`);
            // Logic to update reservation status in Firestore would go here.
            // But since reservation is added AFTER initialize in PaymentPageClient, we need to adapt.
            // Currently, PaymentPageClient creates the ticket/reservation document upon getting "success" from initialize.
            // In a real webhook, the ticket should be marked "paid" here.

            // Return OK so PayTR knows we received the callback
            return new NextResponse('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
        } else {
            console.error(`Payment failed for order ${merchant_oid}: ${failed_reason_msg}`);
            return new NextResponse('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
        }

    } catch (error) {
        console.error('PayTR Callback Error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
