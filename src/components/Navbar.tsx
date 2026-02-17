"use client";

import Link from 'next/link';
import Image from "next/image";
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { X, Ticket, Shield, LogOut, Info, Search, Home, Calendar, Users, MapPin, Mail, Sun, Moon, BookOpen, Menu, User, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useNotifications } from '@/context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import { Bell } from 'lucide-react';

export default function Navbar() {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const [showDropdown, setShowDropdown] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false); // Renamed to matches user snippet somewhat, but keeping logic consistent
    const { unreadCount } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);

    // Search State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (term.trim()) {
            router.push(`/?search=${encodeURIComponent(term)}`);
        } else {
            router.push('/');
        }
    };

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Body scroll lock when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
        setShowDropdown(false);
        setIsOpen(false);
    };

    const navLinks = [
        { href: '/', label: 'Etkinlikler', icon: Home },
        { href: '/kurslar', label: 'Kurslar', icon: BookOpen },
        { href: '/takvim', label: 'Takvim', icon: Calendar },
        { href: '/kulupler', label: 'Kulüpler', icon: Users },
        { href: '/mekanlar', label: 'Mekanlar', icon: MapPin },
        { href: '/hakkimizda', label: 'Hakkımızda', icon: Info },
        { href: '/iletisim', label: 'İletişim', icon: Mail },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 border-b border-white/10 transition-all duration-300 ${scrolled || isOpen
            ? 'bg-black'
            : 'bg-black/80 backdrop-blur-md'
            }`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">

                    {/* LOGO KISMI */}
                    <Link href="/" className="flex items-center gap-3 group">
                        {/* Logo Resmi - Çerçevesiz ve Net */}
                        <div className="relative w-14 h-14 rounded-full overflow-hidden">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                fill
                                className="object-cover scale-110"
                            />
                        </div>

                        {/* Yazı - Yan Yana */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-2xl font-bold text-white tracking-tight">Sivas</span>
                            <span className="text-2xl font-bold text-primary tracking-tight">Etkinlikleri</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium hover:text-primary transition-colors relative group text-gray-300 hover:text-white"
                            >
                                {link.label}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        ))}
                    </div>

                    {/* Desktop User Section */}
                    <div className="hidden lg:flex items-center gap-4">
                        {/* Search Bar */}
                        <div className={`relative flex items-center transition-all duration-300 ${showDropdown ? 'mr-2' : ''}`}>
                            <div className={`
                                flex items-center overflow-hidden transition-all duration-300 rounded-full border 
                                ${isSearchOpen
                                    ? 'w-64 pl-4 pr-10 bg-black border-primary/50 shadow-lg'
                                    : 'w-10 h-10 bg-transparent border-transparent'}
                            `}>
                                {isSearchOpen && (
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        placeholder="Etkinlik ara..."
                                        className="w-full bg-transparent border-none text-sm text-white focus:outline-none placeholder:text-gray-400"
                                        autoFocus
                                    />
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    if (isSearchOpen && !searchTerm) {
                                        setIsSearchOpen(false);
                                    } else if (!isSearchOpen) {
                                        setIsSearchOpen(true);
                                    }
                                }}
                                className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'text-gray-300 hover:text-white' : 'hover:bg-white/10 text-gray-300 hover:text-white'}`}
                                aria-label="Arama"
                            >
                                <Search className="w-5 h-5" />
                            </button>


                            {/* Theme Toggle Button */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-300 hover:text-primary mr-2"
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            {/* Notification Bell */}
                            {user && (
                                <div className="relative mr-2">
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-300 hover:text-primary relative"
                                    >
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-black">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                    {showNotifications && (
                                        <NotificationDropdown onClose={() => setShowNotifications(false)} />
                                    )}
                                </div>
                            )}

                            {isSearchOpen && (
                                // ...
                                <button
                                    onClick={() => {
                                        setIsSearchOpen(false);
                                        setSearchTerm('');
                                        router.push('/');
                                    }}
                                    className="absolute right-8 text-gray-400 hover:text-white p-1"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="w-20 h-8 bg-gray-800 animate-pulse rounded"></div>
                        ) : user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all hover:scale-105"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/10">
                                        {user.email?.[0].toUpperCase()}
                                    </div>
                                </button>

                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-slideInDown z-50">
                                        <div className="p-4 border-b border-white/10 bg-white/5">
                                            <p className="text-sm font-medium text-white truncate">{user.email}</p>
                                            <p className="text-xs text-gray-400 mt-1">Hoş geldiniz!</p>
                                        </div>

                                        <div className="p-2 space-y-1">
                                            <Link
                                                href="/biletlerim"
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm group text-gray-300 hover:text-white"
                                            >
                                                <Ticket className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                                                <span>Biletlerim</span>
                                            </Link>

                                            <Link
                                                href="/profil"
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm group text-gray-300 hover:text-white"
                                            >
                                                <User className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                                                <span>Profilim</span>
                                            </Link>

                                            <Link
                                                href="/panel"
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm group text-gray-300 hover:text-white"
                                            >
                                                <LayoutDashboard className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                                                <span>Yönetim Paneli</span>
                                            </Link>

                                            {isAdmin && (
                                                <Link
                                                    href="/admin"
                                                    onClick={() => setShowDropdown(false)}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm group text-gray-300 hover:text-white"
                                                >
                                                    <Shield className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                                                    <span>Admin Panel</span>
                                                </Link>
                                            )}

                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-sm text-red-500 group"
                                            >
                                                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                <span>Çıkış Yap</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium text-white"
                                >
                                    Giriş Yap
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-glow text-sm font-medium"
                                >
                                    Kayıt Ol
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Notification Bell */}
                    <div className="lg:hidden relative mr-2">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 text-white hover:text-primary transition-colors relative"
                        >
                            <Bell className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-black">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                        {showNotifications && (
                            <NotificationDropdown onClose={() => setShowNotifications(false)} />
                        )}
                    </div>

                    {/* MOBİL MENÜ BUTONU (Matches User Snippet) */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden p-2 text-white hover:text-primary z-50 relative transition-colors"
                    >
                        {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                    </button>
                </div>
            </div>

            {/* MOBİL MENÜ - TAM EKRAN SİYAH (User's Requested Style) */}
            {isOpen && (
                <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-black z-40 flex flex-col pt-24 px-6 animate-fadeIn overflow-y-auto">
                    <div className="flex flex-col space-y-2 pb-10">
                        {/* Search in Mobile */}
                        <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center mb-6">
                            <Search className="w-5 h-5 text-gray-400 ml-2" />
                            <input
                                type="text"
                                placeholder="Etkinlik ara..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="flex-1 bg-transparent border-none focus:outline-none p-2 text-white placeholder:text-gray-500"
                            />
                        </div>

                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-xl font-bold text-white py-4 border-b border-white/10 flex items-center justify-between group"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                    <Icon className="w-5 h-5 text-gray-500 group-hover:text-primary" />
                                </Link>
                            )
                        })}

                        <div className="pt-8 flex flex-col gap-4">
                            {/* Theme Toggle Mobile */}
                            <button
                                onClick={toggleTheme}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white"
                            >
                                <span className="flex items-center gap-3 font-bold">
                                    {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-amber-500" />}
                                    {theme === 'dark' ? 'Koyu Mod' : 'Açık Mod'}
                                </span>
                            </button>

                            {user ? (
                                <>
                                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{user.email?.split('@')[0]}</p>
                                            <p className="text-sm text-gray-400">{isAdmin ? 'Yönetici' : 'Üye'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <Link href="/biletlerim" className="flex items-center justify-center gap-2 py-3 bg-zinc-800 rounded-xl text-white font-medium border border-white/10" onClick={() => setIsOpen(false)}>
                                            <Ticket className="w-5 h-5 text-primary" />
                                            <span>Biletlerim</span>
                                        </Link>
                                        <Link href="/profil" className="flex items-center justify-center gap-2 py-3 bg-zinc-800 rounded-xl text-white font-medium border border-white/10" onClick={() => setIsOpen(false)}>
                                            <User className="w-5 h-5 text-primary" />
                                            <span>Profilim</span>
                                        </Link>
                                    </div>

                                    <Link href="/panel" className="w-full py-4 bg-gradient-to-r from-primary to-yellow-600 text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg mb-4 mt-4">
                                        <LayoutDashboard className="w-6 h-6" /> Yönetim Paneli
                                    </Link>
                                    {isAdmin && (
                                        <Link href="/admin" className="w-full py-3 bg-purple-600/20 text-purple-400 font-bold rounded-xl text-center border border-purple-500/20">
                                            Admin Paneli
                                        </Link>
                                    )}
                                    <button onClick={handleLogout} className="w-full py-3 bg-red-500/10 text-red-500 font-bold rounded-xl border border-red-500/20">
                                        Çıkış Yap
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="w-full py-4 bg-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-colors">
                                        <LogIn className="w-5 h-5" /> Giriş Yap
                                    </Link>
                                    <Link href="/register" className="w-full py-4 bg-primary text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-glow hover:bg-primary/90 transition-colors">
                                        <UserPlus className="w-5 h-5" /> Kayıt Ol
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}