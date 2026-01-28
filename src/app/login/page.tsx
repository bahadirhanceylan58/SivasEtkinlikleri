"use client";

import Link from 'next/link';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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

    const validatePassword = () => {
        if (!password) {
            setPasswordError('Şifre gereklidir');
            return false;
        }
        if (password.length < 6) {
            setPasswordError('Şifre en az 6 karakter olmalıdır');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const handleEmailBlur = () => {
        validateEmail();
    };

    const handlePasswordBlur = () => {
        validatePassword();
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();

        if (!isEmailValid || !isPasswordValid) {
            return;
        }

        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (user) {
                const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
                if (adminEmails.includes(user.email || '')) {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            }
        } catch (err: any) {
            setError('Giriş başarısız. E-posta veya şifre hatalı.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = email && password && !emailError && !passwordError;

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            </div>

            {/* Top Gradient */}
            <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

            <div className="w-full max-w-md glass-strong rounded-2xl p-8 relative z-10 shadow-2xl animate-scaleIn border border-white/10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Hoş Geldiniz</h1>
                    <p className="text-gray-400">Sivas Etkinlikleri hesabınıza giriş yapın</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center animate-slideInDown flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">E-posta Adresi</label>
                        <div className="relative group">
                            <input
                                type="email"
                                placeholder="ornek@email.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (emailError) setEmailError('');
                                }}
                                onBlur={handleEmailBlur}
                                className={`w-full glass border rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-500 focus:outline-none transition-all ${emailError
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/30'
                                        : 'border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/30'
                                    }`}
                            />
                            <Mail className={`absolute left-3.5 top-3.5 w-5 h-5 transition-colors ${emailError ? 'text-red-500' : 'text-gray-500 group-focus-within:text-primary'
                                }`} />
                        </div>
                        {emailError && (
                            <div className="flex items-center gap-2 text-red-400 text-xs mt-1 animate-slideInDown ml-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{emailError}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-medium text-gray-300">Şifre</label>
                            <Link href="#" className="text-xs text-primary hover:text-primary-hover font-medium transition-colors">
                                Şifremi Unuttum?
                            </Link>
                        </div>
                        <div className="relative group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (passwordError) setPasswordError('');
                                }}
                                onBlur={handlePasswordBlur}
                                className={`w-full glass border rounded-xl px-4 py-3 pl-11 pr-11 text-white placeholder-gray-500 focus:outline-none transition-all ${passwordError
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/30'
                                        : 'border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/30'
                                    }`}
                            />
                            <Lock className={`absolute left-3.5 top-3.5 w-5 h-5 transition-colors ${passwordError ? 'text-red-500' : 'text-gray-500 group-focus-within:text-primary'
                                }`} />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-gray-500 hover:text-primary transition-colors"
                                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {passwordError && (
                            <div className="flex items-center gap-2 text-red-400 text-xs mt-1 animate-slideInDown ml-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{passwordError}</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !isFormValid}
                        className={`w-full font-bold py-3.5 rounded-xl transition-all transform mt-2 flex items-center justify-center gap-2 group ${loading || !isFormValid
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-primary hover:bg-primary-hover text-black shadow-glow hover:shadow-glow-lg hover:scale-[1.02]'
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
                                Giriş yapılıyor...
                            </>
                        ) : (
                            <>
                                Giriş Yap
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-gray-400 text-sm">
                        Hesabınız yok mu?{' '}
                        <Link href="/register" className="text-primary hover:text-primary-hover font-bold ml-1 transition-colors hover:underline">
                            Kayıt Ol
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
