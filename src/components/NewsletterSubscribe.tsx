'use client';

import React, { useState } from 'react';
import { Mail, Check, Loader2 } from 'lucide-react';

export default function NewsletterSubscribe() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message || 'Abonelik başarılı!');
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Bir hata oluştu.');
            }
        } catch (error) {
            console.error('Abonelik hatası:', error);
            setStatus('error');
            setMessage('Bağlantı hatası oluştu.');
        } finally {
            // 3 saniye sonra duruma göre resetle
            if (status !== 'success') {
                const timer = setTimeout(() => {
                    //   setStatus('idle');
                    //   setMessage('');
                }, 3000);
            }
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {status === 'success' ? (
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 animate-fadeIn">
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{message}</p>
                </div>
            ) : (
                <form onSubmit={handleSubscribe} className="relative">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="E-posta adresiniz"
                            required
                            className="w-full pl-10 pr-32 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground transition-all"
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="absolute right-1 top-1 bottom-1 px-4 bg-primary text-black font-medium rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {status === 'loading' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'Abone Ol'
                            )}
                        </button>
                    </div>
                    {status === 'error' && (
                        <p className="absolute -bottom-6 left-0 text-xs text-red-500 animate-fadeIn">
                            {message}
                        </p>
                    )}
                </form>
            )}
            <p className="text-xs text-muted-foreground mt-3 text-center">
                En yeni etkinliklerden ve kurslardan haberdar olun. Spam yok, söz veriyoruz!
            </p>
        </div>
    );
}
