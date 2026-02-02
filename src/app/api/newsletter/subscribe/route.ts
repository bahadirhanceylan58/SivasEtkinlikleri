import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { NewsletterWelcomeEmail } from '@/lib/emailTemplates';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import React from 'react';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email adresi gerekli' },
                { status: 400 }
            );
        }

        // Email formatı kontrolü
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Geçersiz email formatı' },
                { status: 400 }
            );
        }

        // Zaten abone mi kontrol et
        const subscribersRef = collection(db, 'newsletter_subscribers');
        const q = query(subscribersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Zaten abone, hata yerine başarı dön ama tekrar kaydetme
            return NextResponse.json({
                success: true,
                message: 'Zaten bültenimize abonesiniz!'
            });
        }

        // Firestore'a kaydet
        await addDoc(subscribersRef, {
            email,
            subscribedAt: serverTimestamp(),
            isActive: true,
            source: 'footer_form'
        });

        // Hoşgeldin emaili gönder
        try {
            const emailTemplate = React.createElement(NewsletterWelcomeEmail, {
                userEmail: email
            });

            await sendEmail({
                to: email,
                subject: '🎉 Sivas Etkinlikleri Bültenine Hoş Geldiniz!',
                react: emailTemplate,
            });
        } catch (emailError) {
            console.error('Hoşgeldin emaili gönderilemedi:', emailError);
            // Email hatası aboneliği iptal ettirmemeli
        }

        return NextResponse.json({
            success: true,
            message: 'Bültenimize başarıyla abone oldunuz!'
        });

    } catch (error) {
        console.error('Newsletter abonelik hatası:', error);
        return NextResponse.json(
            { error: 'Sunucu hatası oluştu' },
            { status: 500 }
        );
    }
}
