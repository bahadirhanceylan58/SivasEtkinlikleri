import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { EventRegistrationEmail, CourseRegistrationEmail } from '@/lib/emailTemplates';
import React from 'react';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, registrationData, userEmail } = body;

        if (!type || !registrationData || !userEmail) {
            return NextResponse.json(
                { error: 'Eksik parametreler' },
                { status: 400 }
            );
        }

        let emailTemplate: React.ReactElement;
        let subject: string;

        if (type === 'event') {
            subject = `🎉 ${registrationData.eventTitle} - Kayıt Onayı`;
            emailTemplate = React.createElement(EventRegistrationEmail, {
                userName: registrationData.userName,
                eventTitle: registrationData.eventTitle,
                eventDate: registrationData.eventDate,
                eventLocation: registrationData.eventLocation,
                registrationId: registrationData.registrationId,
            });
        } else if (type === 'course') {
            subject = `📚 ${registrationData.courseTitle} - Başvuru Alındı`;
            emailTemplate = React.createElement(CourseRegistrationEmail, {
                userName: registrationData.userName,
                courseTitle: registrationData.courseTitle,
                courseDescription: registrationData.courseDescription,
                userEmail: registrationData.userEmail,
                userPhone: registrationData.userPhone,
            });
        } else {
            return NextResponse.json(
                { error: 'Geçersiz tip' },
                { status: 400 }
            );
        }

        const result = await sendEmail({
            to: userEmail,
            subject,
            react: emailTemplate,
        });

        if (!result.success) {
            console.error('Email gönderim hatası:', result.error);
            return NextResponse.json(
                { error: 'Email gönderilemedi' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Email başarıyla gönderildi',
            data: result.data,
        });

    } catch (error) {
        console.error('API hatası:', error);
        return NextResponse.json(
            { error: 'Sunucu hatası' },
            { status: 500 }
        );
    }
}
