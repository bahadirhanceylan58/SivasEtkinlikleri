/**
 * Verify Google reCAPTCHA v3 token
 * @param token - Token from client-side reCAPTCHA
 * @returns true if verification succeeds and score is above threshold
 */
export async function verifyCaptcha(token: string): Promise<{ success: boolean; score?: number; error?: string }> {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
        console.warn('RECAPTCHA_SECRET_KEY not configured, skipping verification');
        return { success: true }; // Allow in development
    }

    try {
        const response = await fetch(
            'https://www.google.com/recaptcha/api/siteverify',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `secret=${secretKey}&response=${token}`,
            }
        );

        const data = await response.json();

        if (!data.success) {
            return {
                success: false,
                error: data['error-codes']?.join(', ') || 'Verification failed',
            };
        }

        // reCAPTCHA v3 returns a score (0.0 - 1.0)
        // Higher score = more likely human
        const score = data.score || 0;
        const threshold = 0.5; // Adjust based on your needs

        return {
            success: score >= threshold,
            score,
            error: score < threshold ? 'Score too low, possible bot' : undefined,
        };
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return {
            success: false,
            error: 'Verification service error',
        };
    }
}
