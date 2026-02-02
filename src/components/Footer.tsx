'use client';

import { Instagram, Facebook, Twitter, Linkedin, Youtube, Music, Apple, Smartphone, CreditCard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';


export default function Footer() {
    return (
        <footer className="bg-black text-gray-400 py-12 border-t border-neutral-800 font-sans">
            <div className="container mx-auto px-4">
                {/* Newsletter Section Removed */}

                {/* Top Section: Logo & Socials */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-10 h-10 overflow-hidden rounded-full border border-neutral-800 group-hover:scale-110 transition-transform">
                            <Image
                                src="/icon-192x192.png"
                                alt="Sivas Etkinlikleri"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="text-2xl font-bold text-primary tracking-tight">sivasetkinlikleri</span>
                    </Link>

                    {/* Social Icons */}
                    <div className="flex items-center gap-4">
                        <SocialIcon href="#" icon={<Facebook size={20} />} label="Facebook" />
                        <SocialIcon href="https://www.instagram.com/sivasetkinlikleri/" icon={<Instagram size={20} />} label="Instagram" />
                        <SocialIcon href="#" icon={<Youtube size={20} />} label="Youtube" />
                        <SocialIcon href="#" icon={<Twitter size={20} />} label="Twitter" />
                        <SocialIcon href="#" icon={<Linkedin size={20} />} label="Linkedin" />
                        <SocialIcon href="#" icon={<Music size={20} />} label="Spotify" />
                    </div>
                </div>

                {/* Main Links Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Column 1 */}
                    <div className="space-y-3">
                        <FooterLink href="/hakkimizda">HAKKIMIZDA</FooterLink>
                        <FooterLink href="#">KULLANICI SÖZLEŞMESİ</FooterLink>
                        <FooterLink href="#">KULLANIM KOŞULLARI</FooterLink>
                        <FooterLink href="#">AÇIK RIZA BEYANI</FooterLink>
                        <FooterLink href="#">ÜYELİK SÖZLEŞMESİ</FooterLink>
                        <FooterLink href="#">İADE GARANTİSİ HİZMET KOŞULLARI</FooterLink>
                        <FooterLink href="/iletisim">İLETİŞİM</FooterLink>
                        <FooterLink href="#">BLOG</FooterLink>
                        <Link href="/admin" className="inline-block mt-2 px-3 py-1 bg-neutral-800 text-xs rounded hover:bg-primary hover:text-black transition-colors">
                            Yönetici Girişi
                        </Link>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-3">
                        <FooterLink href="#">GİZLİLİK</FooterLink>
                        <FooterLink href="#">ÇEREZ POLİTİKASI</FooterLink>
                        <FooterLink href="#">KİŞİSEL VERİLERİN KORUNMASI</FooterLink>
                        <FooterLink href="#">ETKİNLİK PANEL</FooterLink>
                        <FooterLink href="#">TİCARİ ELEKTRONİK İLETİ BİLGİLENDİRME METNİ</FooterLink>
                        <FooterLink href="#">SIKÇA SORULAN SORULAR</FooterLink>
                        <FooterLink href="#">ÇEREZ TERCİHLERİ</FooterLink>
                    </div>

                    {/* Column 3 & 4 (Right Side - Apps & Copyright) */}
                    <div className="lg:col-span-2 flex flex-col items-center md:items-end gap-8">
                        {/* App Buttons */}
                        <div className="flex gap-4">
                            <AppButton
                                icon={<Smartphone className="w-6 h-6" />}
                                subtitle="İNDİRİN"
                                title="Google Play"
                            />
                            <AppButton
                                icon={<Apple className="w-6 h-6" />}
                                subtitle="App Store'dan"
                                title="İndirin"
                            />
                        </div>

                        {/* Payment Icons */}
                        <div className="flex gap-2 text-white">
                            <PaymentIcon label="Mastercard" color="#EB001B" />
                            <PaymentIcon label="Visa" color="#1A1F71" />
                            <PaymentIcon label="Amex" color="#2E77BC" />
                        </div>

                        {/* Copyright */}
                        <div className="text-right text-xs text-neutral-500">
                            <p className="mb-1">Sivas Etkinlikleri © Tüm Hakları Saklıdır</p>
                            <p>Kredi kartı bilgileriniz 256bit SSL sertifikası ile korunmaktadır.</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// Helper Components
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="block text-xs font-semibold text-neutral-400 hover:text-white transition-colors uppercase tracking-wide"
        >
            {children}
        </Link>
    );
}

function SocialIcon({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-white hover:text-black transition-all hover:scale-110"
            aria-label={label}
        >
            {icon}
        </a>
    );
}

function AppButton({ icon, subtitle, title }: { icon: React.ReactNode; subtitle: string; title: string }) {
    return (
        <button className="flex items-center gap-3 bg-black border border-neutral-600 rounded-lg px-4 py-2 hover:border-white transition-colors group text-left min-w-[160px]">
            <div className="text-white group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <div className="text-[10px] text-neutral-400 leading-none mb-1">{subtitle}</div>
                <div className="text-sm font-bold text-white leading-none">{title}</div>
            </div>
        </button>
    );
}

function PaymentIcon({ label, color }: { label: string; color: string }) {
    return (
        <div
            className="h-8 px-2 bg-white rounded flex items-center justify-center font-bold text-xs italic tracking-tighter"
            style={{ color: color }}
        >
            {label}
        </div>
    );
}