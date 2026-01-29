'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Hero() {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToEvents = () => {
        const eventsSection = document.getElementById('etkinlikler');
        eventsSection?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative h-[600px] flex items-center justify-center bg-background text-foreground overflow-hidden transition-colors duration-300">
            {/* Background Image with Parallax */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-primary/5 to-white/90 dark:from-black/90 dark:via-primary/5 dark:to-black/90 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80"
                    alt="Concert Stage and Lights"
                    className="w-full h-full object-cover transition-transform duration-75"
                    style={{ transform: `translateY(${scrollY * 0.5}px)` }}
                />
            </div>

            {/* Floating Orbs */}
            <div className="absolute inset-0 z-[5] pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            </div>

            {/* Content */}
            <div className="container relative z-20 text-center px-4">
                <h1 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight">
                    <span className="inline-block animate-slideInDown" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
                        Şehrin Tadını
                    </span>
                    <br />
                    <span className="inline-block text-primary animate-slideInUp" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
                        Çıkar!
                    </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fadeIn" style={{ animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}>
                    Sivas'ın en iyi etkinlikleri, konserleri ve tiyatroları bir arada.
                </p>

                {/* CTA Button */}
                <Link
                    href="#etkinlikler"
                    onClick={(e) => {
                        e.preventDefault();
                        scrollToEvents();
                    }}
                    className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-primary hover:bg-primary-hover text-black font-bold rounded-full transition-all transform hover:scale-105 hover:shadow-glow-lg animate-scaleIn"
                    style={{ animationDelay: '0.7s', opacity: 0, animationFillMode: 'forwards' }}
                >
                    Etkinlikleri Keşfet
                </Link>
            </div>

            {/* Scroll Indicator */}
            <button
                onClick={scrollToEvents}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-muted-foreground hover:text-foreground transition-colors animate-bounce cursor-pointer"
                aria-label="Aşağı kaydır"
            >
                <ChevronDown className="w-8 h-8" />
            </button>
        </section>
    );
}
