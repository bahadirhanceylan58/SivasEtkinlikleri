"use client";

import { Search, Filter, X, ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { CATEGORIES } from '@/data/mockData';

interface FilterState {
    search: string;
    category: string;
    date: string; // 'all', 'today', 'week', 'weekend'
    minPrice: string;
    maxPrice: string;
}

interface EventFiltersProps {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
}

export default function EventFilters({ filters, setFilters }: EventFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Flatten categories for the pill list
    const allCategories = [
        { id: 'all', name: 'Tümü' },
        ...CATEGORIES.flatMap(cat => [
            { id: cat.id, name: cat.name },
            ...cat.sub.map(sub => ({ id: sub, name: sub }))
        ])
    ];

    // Filter sub-categories to avoid clutter if desired, or keep them all. 
    // For a cleaner look, let's show main categories + 'all'.
    const mainCategories = [
        { id: 'all', name: 'Tümü' },
        ...CATEGORIES.map(cat => ({ id: cat.id, name: cat.name }))
    ];

    const handleChange = (key: keyof FilterState, value: string) => {
        setFilters({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            category: 'all',
            date: 'all',
            minPrice: '',
            maxPrice: ''
        });
        setIsOpen(false);
    };

    const hasActiveFilters = filters.category !== 'all' || filters.date !== 'all' || filters.minPrice !== '' || filters.maxPrice !== '';

    return (
        <div className="w-full mb-8 relative z-20">
            <div className="flex flex-col gap-4">

                {/* 1. Top Bar: Search & Advanced Filter Toggle */}
                <div className="flex gap-3">
                    <div className="relative flex-1 group">
                        <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg group-hover:bg-primary/30 transition-all opacity-0 group-hover:opacity-100" />
                        <div className="relative flex items-center bg-neutral-900/80 backdrop-blur-md border border-white/10 rounded-2xl transition-all group-hover:border-primary/50 focus-within:border-primary focus-within:shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                            <Search className="ml-4 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Etkinlik, sanatçı veya mekan ara..."
                                value={filters.search}
                                onChange={(e) => handleChange('search', e.target.value)}
                                className="w-full bg-transparent border-none rounded-2xl pl-3 pr-4 py-4 text-white focus:outline-none placeholder:text-gray-500 font-medium"
                            />
                            {filters.search && (
                                <button
                                    onClick={() => handleChange('search', '')}
                                    className="mr-2 p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`
                            relative px-5 rounded-2xl font-semibold flex items-center gap-2 transition-all duration-300 border
                            ${isOpen || hasActiveFilters
                                ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                                : 'bg-neutral-900/80 text-white border-white/10 hover:border-white/30 hover:bg-neutral-800'
                            }
                        `}
                    >
                        <Filter className="w-5 h-5" />
                        <span className="hidden sm:inline">Filtrele</span>
                        {(hasActiveFilters) && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black" />
                        )}
                    </button>
                </div>

                {/* 2. Category Pills (Horizontal Scroll) */}
                <div className="w-full overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex gap-2 min-w-max">
                        {mainCategories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => handleChange('category', cat.id)}
                                className={`
                                    px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-300 whitespace-nowrap
                                    ${filters.category === cat.id
                                        ? 'bg-white text-black border-white shadow-lg scale-105'
                                        : 'bg-neutral-900/50 text-gray-400 border-white/10 hover:border-white/30 hover:text-white hover:bg-neutral-800'
                                    }
                                `}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Expanded Advanced Filters */}
                <div className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
                `}>
                    <div className="bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                <Filter className="w-5 h-5 text-primary" />
                                Detaylı Filtreleme
                            </h3>
                            <button onClick={clearFilters} className="text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2">
                                <X className="w-4 h-4" /> Tümünü Temizle
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Date Filter */}
                            <div className="space-y-3">
                                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider ml-1">Zaman</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'all', label: 'Tarih Farketmez' },
                                        { id: 'today', label: 'Bugün' },
                                        { id: 'weekend', label: 'Bu Hafta Sonu' },
                                        { id: 'week', label: 'Bu Hafta' }
                                    ].map(dateOpt => (
                                        <button
                                            key={dateOpt.id}
                                            onClick={() => handleChange('date', dateOpt.id)}
                                            className={`
                                                relative p-3 rounded-xl text-sm font-medium transition-all text-left border flex justify-between items-center group
                                                ${filters.date === dateOpt.id
                                                    ? 'bg-primary/10 border-primary text-primary'
                                                    : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20 hover:text-white'
                                                }
                                            `}
                                        >
                                            {dateOpt.label}
                                            {filters.date === dateOpt.id && <Check className="w-4 h-4" />}
                                            <div className={`absolute inset-0 rounded-xl bg-primary/5 opacity-0 transition-opacity ${filters.date === dateOpt.id ? 'opacity-100' : 'group-hover:opacity-100'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="space-y-3">
                                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider ml-1">Fiyat Aralığı</label>
                                <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₺</span>
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={filters.minPrice}
                                                onChange={(e) => handleChange('minPrice', e.target.value)}
                                                className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-white text-sm focus:border-primary/50 outline-none transition-colors"
                                            />
                                        </div>
                                        <span className="text-gray-600 font-medium">-</span>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₺</span>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={filters.maxPrice}
                                                onChange={(e) => handleChange('maxPrice', e.target.value)}
                                                className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-white text-sm focus:border-primary/50 outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                        {[
                                            { label: '₺0 - ₺100', min: '0', max: '100' },
                                            { label: '₺100 - ₺250', min: '100', max: '250' },
                                            { label: '₺250+', min: '250', max: '' }
                                        ].map((priceOpt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setFilters({ ...filters, minPrice: priceOpt.min, maxPrice: priceOpt.max });
                                                }}
                                                className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-gray-400 hover:text-white transition-colors"
                                            >
                                                {priceOpt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
