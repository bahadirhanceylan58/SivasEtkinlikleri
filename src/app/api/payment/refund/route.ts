import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { releaseSeats, generateSeatId } from '@/lib/seatUtils';

export async function POST(req: Request) {
    try {
        const { merchant_oid, eventId, userUid } = await req.json();

        if (!merchant_oid || !eventId || !userUid) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // 1. Get real order details from Firestore
        const orderRef = doc(db, 'orders', merchant_oid);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const orderData = orderSnap.data();

        // Let's protect against double refunds
        if (orderData.status === 'refunded') {
            return NextResponse.json({ error: 'Order already refunded' }, { status: 400 });
        }

        // Use the actual payment amount from PayTR callback (paymentAmount string or body amount)
        // Ensure it's in kuruş. PayTR callback paymentAmount is already kuruş. If not available, fallback to amount * 100.
        let return_amount_kurus: string | number = orderData.paymentAmount;
        if (!return_amount_kurus) {
            if (orderData.amount) {
                return_amount_kurus = Math.round(Number(orderData.amount) * 100).toString();
            } else {
                return NextResponse.json({ error: 'Cannot determine order amount' }, { status: 400 });
            }
        }

        // 2. Prepare PayTR Refund request
        const merchant_id = process.env.PAYTR_MERCHANT_ID;
        const merchant_key = process.env.PAYTR_MERCHANT_KEY;
        const merchant_salt = process.env.PAYTR_MERCHANT_SALT;

        if (!merchant_id || !merchant_key || !merchant_salt) {
            console.error('PayTR credentials missing');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const hashStr = `${merchant_id}${merchant_oid}${return_amount_kurus}${merchant_salt}`;
        const paytr_token = crypto.createHmac('sha256', merchant_key).update(hashStr).digest('base64');

        const params = new URLSearchParams();
        params.append('merchant_id', merchant_id);
        params.append('merchant_oid', merchant_oid);
        params.append('return_amount', return_amount_kurus.toString());
        params.append('paytr_token', paytr_token);

        // 3. Call PayTR API
        const response = await fetch('https://www.paytr.com/odeme/iade', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });

        const resultText = await response.text();
        let result;
        try {
            result = JSON.parse(resultText);
        } catch (e) {
            console.error("PayTR refund parse error:", resultText);
            throw new Error("Invalid response from PayTR");
        }

        if (result.status !== 'success') {
            console.error('PayTR Refund Error:', result);
            return NextResponse.json({ error: result.err_msg || 'Refund failed at gateway' }, { status: 400 });
        }

        // 4. Update Firestore Order
        await updateDoc(orderRef, {
            status: 'refunded',
            refundedAt: new Date().toISOString()
        });

        // 5. Update User Document
        const userRef = doc(db, 'users', userUid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data();
            const updatedTickets = userData.tickets.map((t: any) => {
                if (t.qrCode === merchant_oid) {
                    return { ...t, status: 'refunded' };
                }
                return t;
            });
            await updateDoc(userRef, { tickets: updatedTickets });
        }

        // 6. Release seats if there were any
        if (orderData.body && orderData.body.selectedSeats && orderData.body.selectedSeats.length > 0) {
            const seatIds = orderData.body.selectedSeats.map((s: any) => generateSeatId(s.row, s.seat));
            await releaseSeats(eventId, seatIds);
        }

        return NextResponse.json({ status: 'success' });

    } catch (error: any) {
        console.error('Refund API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
