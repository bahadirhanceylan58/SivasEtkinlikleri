import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { CourseApprovalEmail } from '@/lib/emailTemplates';
import React from 'react';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userName, userEmail, courseTitle, approved, message } = body;

        if (!userName || !userEmail || !courseTitle || approved === undefined) {
            return NextResponse.json(
                { error: 'Eksik parametreler' },
                { status: 400 }
            );
        }

        const subject = approved
            ? `✅ ${courseTitle} - Başvurunuz Onaylandı`
            : `❌ ${courseTitle} - Başvuru Durumu`;

        const emailTemplate = React.createElement(CourseApprovalEmail, {
            userName,
            courseTitle,
            approved,
            message,
        });

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
            message: 'Onay emaili başarıyla gönderildi',
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
