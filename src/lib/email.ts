import { Resend } from 'resend';

// Resend client oluştur
const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
    to: string | string[];
    subject: string;
    react: React.ReactElement;
}

/**
 * Email gönderim helper fonksiyonu
 */
export async function sendEmail({ to, subject, react }: EmailOptions) {
    try {
        const fromEmail = process.env.NEXT_PUBLIC_FROM_EMAIL || 'onboarding@resend.dev';

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: Array.isArray(to) ? to : [to],
            subject,
            react,
        });

        if (error) {
            console.error('Email gönderim hatası:', error);
            return { success: false, error };
        }

        console.log('Email başarıyla gönderildi:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Email gönderim hatası:', error);
        return { success: false, error };
    }
}

export default resend;
