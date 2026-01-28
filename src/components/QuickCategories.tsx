import {
    Mic2,
    Tent,
    Compass,
    Drama,
    Palette,
    Mountain
} from 'lucide-react';
import React from 'react';

interface QuickCategoriesProps {
    setFilters: (filters: any) => void;
}

const QUICK_CATS = [
    {
        id: 'Konser',
        name: 'Konser',
        icon: Mic2,
        color: 'from-purple-500 to-indigo-600',
        shadow: 'shadow-purple-500/30'
    },
    {
        id: 'Tiyatro',
        name: 'Tiyatro',
        icon: Drama,
        color: 'from-pink-500 to-rose-600',
        shadow: 'shadow-pink-500/30'
    },
    {
        id: 'Workshop',
        name: 'Workshop',
        icon: Palette,
        color: 'from-orange-400 to-amber-600',
        shadow: 'shadow-orange-500/30'
    },
    {
        id: 'Gezi',
        name: 'Gezi',
        icon: Compass,
        color: 'from-blue-400 to-cyan-600',
        shadow: 'shadow-blue-500/30'
    },
    {
        id: 'Doğa Yürüyüşü',
        name: 'Doğa Yürüyüşü',
        icon: Mountain,
        color: 'from-emerald-400 to-green-600',
        shadow: 'shadow-emerald-500/30'
    },
    {
        id: 'Kamp',
        name: 'Kamp',
        icon: Tent,
        color: 'from-teal-400 to-emerald-600',
        shadow: 'shadow-teal-500/30'
    }
];

export default function QuickCategories({ setFilters }: QuickCategoriesProps) {
    const handleCategoryClick = (catId: string) => {
        setFilters((prev: any) => ({
            ...prev,
            category: catId,
            search: '' // Clear search to show category results clearly
        }));

        // Smooth scroll to events section
        const element = document.getElementById('etkinlikler');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="py-4 md:py-8 bg-black/50 overflow-hidden">
            <div className="container mx-auto px-4">
                <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
                    <span className="w-1 h-5 md:h-6 bg-primary rounded-full"></span>
                    Popüler Kategoriler
                </h2>

                {/* Desktop Grid Layout (Hidden on Mobile) */}
                <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {QUICK_CATS.map((cat, idx) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className="group relative h-32 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                            {/* Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-90 transition-opacity group-hover:opacity-100`}></div>

                            {/* Glass Overlay */}
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            {/* Decorative Circles */}
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-black/20 rounded-full blur-xl"></div>

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white z-10">
                                <div className={`p-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 ${cat.shadow} shadow-lg group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-300`}>
                                    <cat.icon className="w-8 h-8" strokeWidth={1.5} />
                                </div>
                                <span className="font-bold text-base tracking-wide text-center px-2 group-hover:tracking-wider transition-all">
                                    {cat.name}
                                </span>
                            </div>

                            {/* Border Glow */}
                            <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-white/40 transition-colors"></div>
                        </button>
                    ))}
                </div>

                {/* Mobile Grid Layout (All visible at once) */}
                <div className="md:hidden grid grid-cols-3 gap-2">
                    {QUICK_CATS.map((cat, idx) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className="relative h-24 rounded-xl overflow-hidden active:scale-95 transition-transform"
                        >
                            {/* Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-90`}></div>

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-white z-10 p-1">
                                <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm border border-white/20 shadow-sm">
                                    <cat.icon className="w-5 h-5" strokeWidth={1.5} />
                                </div>
                                <span className="font-bold text-[10px] tracking-wide text-center leading-tight">
                                    {cat.name}
                                </span>
                            </div>

                            {/* Border */}
                            <div className="absolute inset-0 rounded-xl border border-white/10"></div>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
