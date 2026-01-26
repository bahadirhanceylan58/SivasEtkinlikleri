"use client";

import Link from 'next/link';
import { Menu, Search, User, LogOut, Ticket, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
        setShowDropdown(false);
    };

    return (
        <nav className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-50">
            <div className="container mx-auto max-w-7xl px-8 h-20 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-primary">
                    Sivas Etkinlikleri
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                        Etkinlikler
                    </Link>
                    <Link href="/kulupler" className="text-sm font-medium hover:text-primary transition-colors">
                        Kulüpler
                    </Link>
                    <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">
                        Mekanlar
                    </Link>
                    <Link href="/hakkimizda" className="text-sm font-medium hover:text-primary transition-colors">
                        Hakkımızda
                    </Link>
                    <Link href="/iletisim" className="text-sm font-medium hover:text-primary transition-colors">
                        İletişim
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors" aria-label="Search">
                        <Search className="w-5 h-5 text-gray-400" />
                    </button>

                    <div className="hidden md:flex items-center gap-3 relative">
                        {!loading && user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold hover:bg-yellow-400 transition-colors"
                                >
                                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User size={20} />}
                                </button>

                                {showDropdown && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
                                        <div className="p-4 border-b border-neutral-800">
                                            <p className="font-bold text-white truncate">{user.displayName || 'Kullanıcı'}</p>
                                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                        </div>
                                        <div className="p-2">
                                            <Link href="/profil" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                                <User size={16} />
                                                Profilim
                                            </Link>
                                            <Link href="/admin" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                                <Shield size={16} />
                                                Yönetici Paneli
                                            </Link>
                                            <Link href="/biletlerim" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                                <Ticket size={16} />
                                                Biletlerim
                                            </Link>
                                            <Link href="/kulup-basvuru" onClick={() => setShowDropdown(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                                <User size={16} />
                                                Kulüp Oluştur
                                            </Link>
                                        </div>
                                        <div className="p-2 border-t border-neutral-800">
                                            <button onClick={handleLogout} className="flex items-center w-full gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                                                <LogOut size={16} />
                                                Çıkış Yap
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className="px-4 py-2 text-sm font-medium text-white border border-white/20 rounded-full hover:bg-white/10 transition-colors">
                                    Giriş Yap
                                </Link>
                                <Link href="/register" className="px-4 py-2 text-sm font-bold text-black bg-primary rounded-full hover:bg-primary-hover transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                                    Kayıt Ol
                                </Link>
                            </>
                        )}
                    </div>

                    <button className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors" aria-label="Menu">
                        <Menu className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </div>
        </nav>
    );
}
