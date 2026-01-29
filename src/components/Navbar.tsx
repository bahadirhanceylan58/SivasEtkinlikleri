"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Ticket, Shield, LogOut, Info, Search, Home, Phone, User, Calendar, Users, MapPin, Mail, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';


export default function Navbar() {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [showDropdown, setShowDropdown] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Search State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (term.trim()) {
            router.push(`/? search = ${encodeURIComponent(term)} `);
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

    // Body scroll lock when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    // ESC key to close mobile menu
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsMobileMenuOpen(false);
            }
        };
        if (isMobileMenuOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isMobileMenuOpen]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/');
        setShowDropdown(false);
        setIsMobileMenuOpen(false);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const navLinks = [
        { href: '/', label: 'Etkinlikler', icon: Home },
        { href: '/takvim', label: 'Takvim', icon: Calendar },
        { href: '/kulupler', label: 'Kulüpler', icon: Users },
        { href: '#', label: 'Mekanlar', icon: MapPin },
        { href: '/hakkimizda', label: 'Hakkımızda', icon: Info },
        { href: '/iletisim', label: 'İletişim', icon: Mail },
    ];

    return (
        <nav className={`border-b border-border sticky top-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-background/95 backdrop-blur-xl shadow-lg'
            : 'bg-background/80 backdrop-blur-md'
            }`}>
            <div className="container mx-auto max-w-7xl px-4 sm:px-8 h-20 flex items-center justify-between">
                <Link href="/" className="text-2xl font-heading font-bold tracking-tight hover:scale-105 transition-transform group">
                    <span className="text-foreground transition-colors">Sivas</span>
                    <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent ml-1">Etkinlikleri</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium hover:text-primary transition-colors relative group text-foreground/80 hover:text-foreground"
                        >
                            {link.label}
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                        </Link>
                    ))}
                </div>

                {/* Desktop User Section */}
                <div className="hidden md:flex items-center gap-4">
                    {/* Search Bar */}
                    <div className={`relative flex items-center transition-all duration-300 ${showDropdown ? 'mr-2' : ''}`}>
                        <div className={`
                            flex items-center overflow-hidden transition-all duration-300 rounded-full border 
                            ${isSearchOpen
                                ? 'w-64 pl-4 pr-10 bg-background border-primary/50 shadow-lg'
                                : 'w-10 h-10 bg-transparent border-transparent'}
                        `}>
                            {isSearchOpen && (
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Etkinlik ara..."
                                    className="w-full bg-transparent border-none text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
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
                            className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'text-muted-foreground hover:text-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                            aria-label="Arama"
                            title="Arama"
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                            aria-label={theme === 'dark' ? 'Açık Mod' : 'Koyu Mod'}
                            title={theme === 'dark' ? 'Açık Mod' : 'Koyu Mod'}
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {isSearchOpen && (
                            <button
                                onClick={() => {
                                    setIsSearchOpen(false);
                                    setSearchTerm('');
                                    router.push('/');
                                }}
                                className="absolute right-8 text-muted-foreground hover:text-foreground p-1"
                                aria-label="Aramayı Kapat"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="w-20 h-8 bg-muted animate-pulse rounded"></div>
                    ) : user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-all hover:scale-105"
                                aria-label="Kullanıcı menüsü"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold border border-primary/10">
                                    {user.email?.[0].toUpperCase()}
                                </div>
                            </button>

                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-slideInDown z-50">
                                    <div className="p-4 border-b border-border bg-muted/30">
                                        <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Hoş geldiniz!</p>
                                    </div>

                                    <div className="p-2 space-y-1">
                                        <Link
                                            href="/biletlerim"
                                            onClick={() => setShowDropdown(false)}
                                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm group text-foreground"
                                        >
                                            <Ticket className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                                            <span>Biletlerim</span>
                                        </Link>

                                        <Link
                                            href="/profil"
                                            onClick={() => setShowDropdown(false)}
                                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm group text-foreground"
                                        >
                                            <User className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                                            <span>Profilim</span>
                                        </Link>

                                        {isAdmin && (
                                            <Link
                                                href="/admin"
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm group text-foreground"
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
                                className="px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium text-foreground"
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

                {/* Mobile Hamburger Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors relative z-50 text-foreground"
                    aria-label="Menü"
                >
                    <div className="w-6 h-5 flex flex-col justify-between">
                        <span className={`w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                        <span className={`w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                    </div>
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
                        onClick={closeMobileMenu}
                    ></div>

                    {/* Drawer */}
                    <div className={`fixed top-0 right-0 bottom-0 w-80 bg-card border-l border-border z-40 md:hidden shadow-2xl transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}>
                        <div className="h-full overflow-y-auto">
                            {/* Header */}
                            <div className="p-6 border-b border-border bg-muted/30">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-primary">Menü</h2>
                                    <button
                                        onClick={closeMobileMenu}
                                        className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                                        aria-label="Kapat"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* User Info */}
                                {user && (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                            {user.email?.[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                                            <p className="text-xs text-muted-foreground">Hoş geldiniz!</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation Links */}
                            <div className="p-4 space-y-2">
                                {navLinks.map((link, index) => {
                                    const Icon = link.icon;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={closeMobileMenu}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-all hover:translate-x-1 group animate-slideInUp text-foreground"
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                        >
                                            <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                                            <span className="font-medium">{link.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Divider */}
                            <div className="mx-4 border-t border-border"></div>

                            {/* User Actions */}
                            <div className="p-4 space-y-2">
                                {user ? (
                                    <>
                                        <Link
                                            href="/biletlerim"
                                            onClick={closeMobileMenu}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-all hover:translate-x-1 group animate-slideInUp text-foreground"
                                            style={{ animationDelay: '0.25s' }}
                                        >
                                            <Ticket className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                                            <span className="font-medium">Biletlerim</span>
                                        </Link>

                                        {isAdmin && (
                                            <Link
                                                href="/admin"
                                                onClick={closeMobileMenu}
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-all hover:translate-x-1 group animate-slideInUp text-foreground"
                                                style={{ animationDelay: '0.3s' }}
                                            >
                                                <Shield className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                                                <span className="font-medium">Admin Panel</span>
                                            </Link>
                                        )}

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 transition-all hover:translate-x-1 text-red-500 group animate-slideInUp"
                                            style={{ animationDelay: '0.35s' }}
                                        >
                                            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            <span className="font-medium">Çıkış Yap</span>
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-3 animate-slideInUp" style={{ animationDelay: '0.25s' }}>
                                        <Link
                                            href="/login"
                                            onClick={closeMobileMenu}
                                            className="block w-full px-4 py-3 text-center rounded-lg border border-border hover:bg-muted transition-all font-medium text-foreground"
                                        >
                                            Giriş Yap
                                        </Link>
                                        <Link
                                            href="/register"
                                            onClick={closeMobileMenu}
                                            className="block w-full px-4 py-3 text-center bg-primary text-black rounded-lg hover:bg-primary/90 transition-all font-medium"
                                        >
                                            Kayıt Ol
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-border mt-auto">
                                <p className="text-xs text-muted-foreground text-center">
                                    © {new Date().getFullYear()} Sivas Etkinlikleri
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
}
