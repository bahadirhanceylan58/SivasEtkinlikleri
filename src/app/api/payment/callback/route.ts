import * as React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { sendEmail } from '@/lib/email';
import { TicketConfirmationEmail } from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const adminDb = await getAdminDb();
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
            console.log(`Payment successful for order: ${merchant_oid}`);

            // 1. Get the order from Firestore
            const orderDocRef = adminDb.collection('orders').doc(merchant_oid);
            const orderSnap = await orderDocRef.get();

            if (orderSnap.exists) {
                const orderData = orderSnap.data() || {};

                // 2. Update order status
                await orderDocRef.update({
                    status: 'paid',
                    paytrStatus: status,
                    paymentAmount: payment_amount,
                    updatedAt: new Date().toISOString()
                });

                // 2.5 Update Organizer Balance
                if (orderData.ownerId) {
                    const admin = await import('firebase-admin');
                    const balanceRef = adminDb.collection('balances').doc(orderData.ownerId);
                    const amountInTL = Number(payment_amount) / 100;

                    await balanceRef.set({
                        ownerId: orderData.ownerId,
                        totalEarnings: admin.firestore.FieldValue.increment(amountInTL),
                        currentBalance: admin.firestore.FieldValue.increment(amountInTL),
                        lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });

                    console.log(`Balance updated for organizer: ${orderData.ownerId}, Amount: ${amountInTL} TL`);
                }

                // 3. Update the ticket status in user's profile and event reservations
                // Update User's Ticket
                const userRef = adminDb.collection('users').doc(orderData.userId);
                const userSnap = await userRef.get();
                if (userSnap.exists) {
                    const userData = userSnap.data() || {};
                    const updatedTickets = (userData.tickets || []).map((t: any) => {
                        if (t.qrCode === merchant_oid) {
                            return { ...t, status: 'valid', paymentStatus: 'paid' };
                        }
                        return t;
                    });
                    await userRef.update({ tickets: updatedTickets });
                }

                // Update Event Reservation
                const reservationSnap = await adminDb
                    .collection('events')
                    .doc(orderData.eventId)
                    .collection('reservations')
                    .where('qrCode', '==', merchant_oid)
                    .get();

                for (const resDoc of reservationSnap.docs) {
                    await resDoc.ref.update({
                        paymentStatus: 'paid',
                        status: 'valid'
                    });
                }

                // 4. Send Confirmation Email
                try {
                    await sendEmail({
                        to: orderData.userEmail,
                        subject: `Biletiniz Hazır! - ${orderData.eventTitle}`,
                        react: React.createElement(TicketConfirmationEmail, {
                            userName: orderData.userName || 'Değerli Misafirimiz',
                            eventTitle: orderData.eventTitle,
                            eventDate: orderData.body?.event?.date || orderData.body?.eventDate || 'Etkinlik Tarihi',
                            eventLocation: orderData.body?.event?.location || orderData.body?.eventLocation || 'Etkinlik Alanı',
                            qrCode: merchant_oid,
                            ticketCount: orderData.body?.ticketCount || 1,
                            totalAmount: Number(payment_amount) / 100, // PayTR sends amount in kuruş
                            seats: orderData.body?.selectedSeats?.map((s: any) => `${s.row}-${s.seat}`).join(', ')
                        })
                    });
                } catch (emailError) {
                    console.error('Callback Email Error:', emailError);
                }

            } else {
                console.error(`Order not found for callback: ${merchant_oid}`);
            }

            return new NextResponse('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
        } else {
            console.error(`Payment failed for order ${merchant_oid}: ${failed_reason_msg}`);

            // Mark order as failed
            const orderDocRef = adminDb.collection('orders').doc(merchant_oid);
            await orderDocRef.update({
                status: 'failed',
                failedReason: failed_reason_msg,
                updatedAt: new Date().toISOString()
            }).catch(() => { });

            return new NextResponse('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
        }

    } catch (error) {
        console.error('PayTR Callback Error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
