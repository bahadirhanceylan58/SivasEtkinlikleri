'use client';

import { useEffect } from 'react';

declare global {
    interface Window {
        grecaptcha: any;
    }
}

interface ReCaptchaProps {
    siteKey?: string;
    onToken: (token: string) => void;
    action?: string;
}

/**
 * Google reCAPTCHA v3 Component
 * 
 * Usage:
 * <ReCaptcha onToken={(token) => setRecaptchaToken(token)} action="submit_form" />
 */
export default function ReCaptcha({ siteKey, onToken, action = 'submit' }: ReCaptchaProps) {
    const key = siteKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    useEffect(() => {
        if (!key) {
            console.warn('reCAPTCHA site key not configured');
            return;
        }

        // Load reCAPTCHA script
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${key}`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        script.onload = () => {
            // reCAPTCHA is loaded
            console.log('reCAPTCHA loaded');
        };

        return () => {
            // Cleanup
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, [key]);

    const executeRecaptcha = async () => {
        if (!key || !window.grecaptcha) {
            console.warn('reCAPTCHA not ready');
            return;
        }

        try {
            const token = await window.grecaptcha.execute(key, { action });
            onToken(token);
        } catch (error) {
            console.error('reCAPTCHA execution failed:', error);
        }
    };

    // Auto-execute on mount (for invisible reCAPTCHA)
    useEffect(() => {
        if (key && window.grecaptcha) {
            executeRecaptcha();
        }
    }, [key]);

    // This component is invisible for v3
    return null;
}
