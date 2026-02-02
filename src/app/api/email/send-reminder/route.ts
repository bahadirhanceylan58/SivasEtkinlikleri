import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { EventReminderEmail } from '@/lib/emailTemplates';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import React from 'react';

export async function POST(request: NextRequest) {
    try {
        // Basit yetkilendirme kontrolü (daha güçlü bir sistem kullanılabilir)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: 'Yetkisiz erişim' },
                { status: 401 }
            );
        }

        // Yarın başlayacak etkinlikleri bul
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

        const registrationsRef = collection(db, 'registrations');
        const q = query(
            registrationsRef,
            where('eventDate', '>=', Timestamp.fromDate(tomorrow)),
            where('eventDate', '<', Timestamp.fromDate(dayAfterTomorrow))
        );

        const querySnapshot = await getDocs(q);
        const emailPromises: Promise<any>[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            const emailTemplate = React.createElement(EventReminderEmail, {
                userName: data.userName || 'Değerli Katılımcı',
                eventTitle: data.eventTitle,
                eventDate: data.eventDate?.toDate().toLocaleDateString('tr-TR') || '',
                eventLocation: data.eventLocation || '',
                eventUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/etkinlik/${data.eventId}`,
            });

            const emailPromise = sendEmail({
                to: data.userEmail,
                subject: `⏰ ${data.eventTitle} - Yarın Başlıyor!`,
                react: emailTemplate,
            });

            emailPromises.push(emailPromise);
        });

        const results = await Promise.allSettled(emailPromises);

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failCount = results.filter(r => r.status === 'rejected').length;

        return NextResponse.json({
            success: true,
            message: `${successCount} hatırlatma gönderildi, ${failCount} başarısız`,
            total: querySnapshot.size,
            sent: successCount,
            failed: failCount,
        });

    } catch (error) {
        console.error('Hatırlatma gönderim hatası:', error);
        return NextResponse.json(
            { error: 'Sunucu hatası' },
            { status: 500 }
        );
    }
}
