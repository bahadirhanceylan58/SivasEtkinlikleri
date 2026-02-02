import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { NewsletterEmail } from '@/lib/emailTemplates';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { subject, content, adminEmail } = body;

        // Admin yetkisi kontrolü
        const allowedAdmins = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
        if (!adminEmail || !allowedAdmins.includes(adminEmail)) {
            return NextResponse.json(
                { error: 'Yetkisiz erişim' },
                { status: 401 }
            );
        }

        if (!subject || !content) {
            return NextResponse.json(
                { error: 'Başlık ve içerik gerekli' },
                { status: 400 }
            );
        }

        // Tüm subscriber'ları getir
        const subscribersRef = collection(db, 'subscribers');
        const querySnapshot = await getDocs(subscribersRef);

        const emailPromises: Promise<any>[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();

            const emailTemplate = NewsletterEmail({
                subscriberName: data.name,
                subject,
                content,
                unsubscribeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${data.email}`,
            });

            const emailPromise = sendEmail({
                to: data.email,
                subject: `📰 ${subject}`,
                react: emailTemplate,
            });

            emailPromises.push(emailPromise);
        });

        const results = await Promise.allSettled(emailPromises);

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failCount = results.filter(r => r.status === 'rejected').length;

        return NextResponse.json({
            success: true,
            message: `Newsletter gönderildi: ${successCount} başarılı, ${failCount} başarısız`,
            total: querySnapshot.size,
            sent: successCount,
            failed: failCount,
        });

    } catch (error) {
        console.error('Newsletter gönderim hatası:', error);
        return NextResponse.json(
            { error: 'Sunucu hatası' },
            { status: 500 }
        );
    }
}
