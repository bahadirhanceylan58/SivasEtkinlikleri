"use client";

import Link from 'next/link';
import { Mail, ArrowRight, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const validateEmail = () => {
        if (!email.trim()) {
            setEmailError('E-posta adresi gereklidir');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Geçerli bir e-posta adresi girin');
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail()) return;

        setStatus('loading');
        setMessage('');

        try {
            await sendPasswordResetEmail(auth, email);
            setStatus('success');
            setMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.');
        } catch (error: any) {
            setStatus('error');
            console.error(error);
            if (error.code === 'auth/user-not-found') {
                setMessage('Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.');
            } else {
                setMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden transition-colors duration-300">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
            </div>

            {/* Top Gradient */}
            <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

            <div className="w-full max-w-md glass-strong rounded-2xl p-8 relative z-10 shadow-2xl animate-scaleIn">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Şifre Sıfırlama</h1>
                    <p className="text-muted-foreground">E-posta adresinizi girerek şifrenizi sıfırlayabilirsiniz</p>
                </div>

                {status === 'success' ? (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-6 rounded-xl text-center animate-slideInDown space-y-4">
                        <div className="flex justify-center">
                            <CheckCircle className="w-12 h-12" />
                        </div>
                        <p className="font-medium">{message}</p>
                        <Link href="/login" className="inline-flex items-center text-primary hover:text-primary-hover font-bold transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Giriş Sayfasına Dön
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        {status === 'error' && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center animate-slideInDown flex items-center justify-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {message}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground ml-1">E-posta Adresi</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    placeholder="ornek@email.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (emailError) setEmailError('');
                                    }}
                                    className={`w-full glass border rounded-xl px-4 py-3 pl-11 text-foreground placeholder-muted-foreground focus:outline-none transition-all ${emailError
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/30'
                                        : 'border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/30'
                                        }`}
                                />
                                <Mail className={`absolute left-3.5 top-3.5 w-5 h-5 transition-colors ${emailError ? 'text-red-500' : 'text-muted-foreground group-focus-within:text-primary'
                                    }`} />
                            </div>
                            {emailError && (
                                <div className="flex items-center gap-2 text-red-400 text-xs mt-1 animate-slideInDown ml-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>{emailError}</span>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className={`w-full font-bold py-3.5 rounded-xl transition-all transform flex items-center justify-center gap-2 group ${status === 'loading'
                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                : 'bg-primary hover:bg-primary-hover text-black shadow-glow hover:shadow-glow-lg hover:scale-[1.02]'
                                }`}
                        >
                            {status === 'loading' ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Gönderiliyor...
                                </>
                            ) : (
                                <>
                                    Sıfırlama Bağlantısı Gönder
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                                <ArrowLeft className="w-4 h-4" />
                                Giriş sayfasına dön
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
