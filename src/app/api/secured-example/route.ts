import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, RATE_LIMITS, getClientIdentifier } from '@/lib/rateLimit';
import { logAudit, getClientInfo } from '@/lib/auditLog';
import { verifyCaptcha } from '@/lib/verifyCaptcha';

/**
 * Example Secured API Route
 * 
 * Demonstrates all security features:
 * - Rate limiting
 * - reCAPTCHA verification
 * - Audit logging
 */
export async function POST(request: NextRequest) {
    // 1. RATE LIMITING
    const identifier = getClientIdentifier(request);
    const { limit, windowMs } = RATE_LIMITS.api;

    if (!rateLimiter.check(identifier, limit, windowMs)) {
        const remaining = rateLimiter.getRemaining(identifier, limit);

        return NextResponse.json(
            {
                error: 'Too many requests. Please try again later.',
                remaining: remaining,
            },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': limit.toString(),
                    'X-RateLimit-Remaining': remaining.toString(),
                    'Retry-After': Math.ceil(windowMs / 1000).toString(),
                }
            }
        );
    }

    try {
        const body = await request.json();
        const { captchaToken, userId, userEmail, ...data } = body;

        // 2. RECAPTCHA VERIFICATION (optional - only if token provided)
        if (captchaToken) {
            const captchaResult = await verifyCaptcha(captchaToken);

            if (!captchaResult.success) {
                // Log failed CAPTCHA
                const clientInfo = getClientInfo(request.headers);
                await logAudit({
                    userId: userId || 'anonymous',
                    userEmail: userEmail || '',
                    action: 'api_captcha_failed',
                    resource: 'api',
                    details: {
                        score: captchaResult.score,
                        error: captchaResult.error,
                    },
                    status: 'failure',
                    errorMessage: captchaResult.error,
                    ...clientInfo,
                });

                return NextResponse.json(
                    { error: 'CAPTCHA verification failed. Please try again.' },
                    { status: 400 }
                );
            }
        }

        // 3. PROCESS REQUEST
        // ... your business logic here ...
        const result = {
            success: true,
            message: 'Request processed successfully',
            data: data,
        };

        // 4. AUDIT LOG SUCCESS
        const clientInfo = getClientInfo(request.headers);
        await logAudit({
            userId: userId || 'anonymous',
            userEmail: userEmail || '',
            action: 'api_request_success',
            resource: 'api',
            resourceId: 'example',
            details: {
                endpoint: '/api/secured-example',
                requestData: data,
            },
            status: 'success',
            ...clientInfo,
        });

        return NextResponse.json(result);

    } catch (error) {
        // 5. AUDIT LOG FAILURE
        const clientInfo = getClientInfo(request.headers);
        await logAudit({
            userId: 'unknown',
            userEmail: '',
            action: 'api_request_failed',
            resource: 'api',
            details: {
                endpoint: '/api/secured-example',
            },
            status: 'failure',
            errorMessage: (error as Error).message,
            ...clientInfo,
        });

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
