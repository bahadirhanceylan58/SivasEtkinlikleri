'use client';

import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, ArrowUp, ArrowRight, Send, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [error, setError] = useState('');

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('E-posta adresi gereklidir');
            return;
        }

        if (!validateEmail(email)) {
            setError('Geçerli bir e-posta adresi girin');
            return;
        }

        setLoading(true);

        // Simulate API call (replace with actual Firestore call later)
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Success
            setSubscribed(true);
            setEmail('');

            // Reset success message after 5 seconds
            setTimeout(() => {
                setSubscribed(false);
            }, 5000);
        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="bg-card mt-20 py-12 border-t border-border relative transition-colors duration-300">
            {/* Gradient Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
                    {/* Column 1: About */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-primary">Sivas Etkinlikleri</h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Sivas'ın en güncel etkinlik platformu. Konserler, tiyatrolar, topluluklar ve daha fazlası.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href="https://www.instagram.com/sivasetkinlikleri/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-muted hover:bg-primary/20 border border-border hover:border-primary flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-1 group"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-muted hover:bg-primary/20 border border-border hover:border-primary flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-1 group"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-muted hover:bg-primary/20 border border-border hover:border-primary flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-1 group"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-foreground">Hızlı Bağlantılar</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-muted-foreground hover:text-primary text-sm transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    Etkinlikler
                                </Link>
                            </li>
                            <li>
                                <Link href="/kulupler" className="text-muted-foreground hover:text-primary text-sm transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    Kulüpler
                                </Link>
                            </li>
                            <li>
                                <Link href="/hakkimizda" className="text-muted-foreground hover:text-primary text-sm transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    Hakkımızda
                                </Link>
                            </li>
                            <li>
                                <Link href="/iletisim" className="text-muted-foreground hover:text-primary text-sm transition-colors flex items-center gap-2 group">
                                    <span className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    İletişim
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Newsletter & Contact */}
                    <div className="space-y-6">
                        {/* Newsletter Section */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-foreground">Bülten</h3>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                En yeni etkinliklerden haberdar olun
                            </p>

                            {subscribed ? (
                                <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs p-3 rounded-lg animate-slideInDown flex items-center gap-2">
                                    <Send className="w-4 h-4" />
                                    <span>Bültenimize başarıyla abone oldunuz!</span>
                                </div>
                            ) : (
                                <form onSubmit={handleSubscribe} className="space-y-2">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                type="email"
                                                placeholder="E-posta adresiniz"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    if (error) setError('');
                                                }}
                                                disabled={loading}
                                                className={`w-full px-3 py-2.5 pl-9 rounded-lg bg-muted/50 border text-foreground placeholder-muted-foreground text-sm focus:outline-none transition-all ${error
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/50'
                                                    : 'border-border focus:border-primary focus:ring-1 focus:ring-primary/50'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            />
                                            <Mail className={`absolute left-2.5 top-2.5 w-4 h-4 transition-colors ${error ? 'text-red-500' : 'text-muted-foreground'
                                                }`} />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading || !email}
                                            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${loading || !email
                                                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                                : 'bg-primary text-black hover:bg-primary-hover hover:scale-105'
                                                }`}
                                        >
                                            {loading ? (
                                                <div className="w-4 h-4 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
                                            ) : (
                                                <ArrowRight className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    {error && (
                                        <p className="text-red-400 text-xs ml-1 animate-slideInDown">{error}</p>
                                    )}
                                </form>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-3 pt-3 border-t border-border">
                            <h4 className="text-sm font-semibold text-foreground">İletişim</h4>
                            <div className="space-y-2">
                                <a href="tel:05301120662" className="flex items-center gap-3 text-muted-foreground hover:text-primary text-xs transition-colors group">
                                    <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    <span>0530 112 0662</span>
                                </a>
                                <a href="mailto:info@sivasetkinlikleri.com" className="flex items-center gap-3 text-muted-foreground hover:text-primary text-xs transition-colors group">
                                    <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    <span>info@sivasetkinlikleri.com</span>
                                </a>
                                <div className="flex items-start gap-3 text-muted-foreground text-xs">
                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>Sivas, Türkiye</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground text-center md:text-left">
                        © {new Date().getFullYear()} Sivas Etkinlikleri. Tüm hakları saklıdır.
                    </div>

                    {/* Back to Top Button */}
                    <button
                        onClick={scrollToTop}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-primary border border-border hover:border-primary rounded-full transition-all hover:scale-105 group"
                        aria-label="Yukarı çık"
                    >
                        <span>Yukarı Çık</span>
                        <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                    </button>
                </div>
            </div>
        </footer>
    );
}