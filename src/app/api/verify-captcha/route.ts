import { NextRequest, NextResponse } from 'next/server';
import { verifyCaptcha } from '@/lib/verifyCaptcha';

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ success: false, error: 'Token gerekli.' }, { status: 400 });
        }

        const result = await verifyCaptcha(token);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error || 'Doğrulama başarısız.' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ success: false, error: 'Sunucu hatası.' }, { status: 500 });
    }
}
