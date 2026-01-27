"use client";

import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';
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
    };

    const hasActiveFilters = filters.category !== 'all' || filters.date !== 'all' || filters.minPrice !== '' || filters.maxPrice !== '';

    return (
        <div className="w-full space-y-4 mb-8">
            {/* Search Bar */}
            <div className="relative w-full">
                <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Etkinlik, sanatçı veya mekan ara..."
                    value={filters.search}
                    onChange={(e) => handleChange('search', e.target.value)}
                    className="w-full bg-neutral-900/80 border border-neutral-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 text-lg shadow-lg placeholder:text-gray-600"
                />
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`absolute right-2 top-2 p-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors ${isOpen || hasActiveFilters ? 'bg-primary text-black' : 'bg-neutral-800 text-gray-400 hover:text-white'}`}
                >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filtrele</span>
                    {hasActiveFilters && (
                        <span className="w-2 h-2 rounded-full bg-black sm:hidden"></span>
                    )}
                </button>
            </div>

            {/* Expanded Filters */}
            {isOpen && (
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 animate-in slide-in-from-top-2 fade-in duration-200 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Filter className="w-4 h-4 text-primary" />
                            Detaylı Filtreleme
                        </h3>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                                <X className="w-3 h-3" /> Temizle
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Categories */}
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Kategori</label>
                            <select
                                value={filters.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-white focus:border-primary/50 outline-none"
                            >
                                <option value="all">Tüm Kategoriler</option>
                                {CATEGORIES.map(cat => (
                                    <optgroup key={cat.id} label={cat.name}>
                                        <option value={cat.id}>Tüm {cat.name}</option>
                                        {cat.sub.map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Zaman</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => handleChange('date', 'today')}
                                    className={`px-3 py-2 rounded-xl text-sm transition-colors ${filters.date === 'today' ? 'bg-primary text-black font-bold' : 'bg-black text-gray-400 border border-neutral-800 hover:border-gray-600'}`}
                                >
                                    Bugün
                                </button>
                                <button
                                    onClick={() => handleChange('date', 'weekend')}
                                    className={`px-3 py-2 rounded-xl text-sm transition-colors ${filters.date === 'weekend' ? 'bg-primary text-black font-bold' : 'bg-black text-gray-400 border border-neutral-800 hover:border-gray-600'}`}
                                >
                                    Hafta Sonu
                                </button>
                                <button
                                    onClick={() => handleChange('date', 'week')}
                                    className={`px-3 py-2 rounded-xl text-sm transition-colors ${filters.date === 'week' ? 'bg-primary text-black font-bold' : 'bg-black text-gray-400 border border-neutral-800 hover:border-gray-600'}`}
                                >
                                    Bu Hafta
                                </button>
                                <button
                                    onClick={() => handleChange('date', 'all')}
                                    className={`px-3 py-2 rounded-xl text-sm transition-colors ${filters.date === 'all' ? 'bg-primary text-black font-bold' : 'bg-black text-gray-400 border border-neutral-800 hover:border-gray-600'}`}
                                >
                                    Tümü
                                </button>
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Fiyat Aralığı</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min ₺"
                                    value={filters.minPrice}
                                    onChange={(e) => handleChange('minPrice', e.target.value)}
                                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-white focus:border-primary/50 outline-none"
                                />
                                <span className="text-gray-600">-</span>
                                <input
                                    type="number"
                                    placeholder="Max ₺"
                                    value={filters.maxPrice}
                                    onChange={(e) => handleChange('maxPrice', e.target.value)}
                                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-white focus:border-primary/50 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
