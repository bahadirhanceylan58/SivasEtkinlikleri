"use client";

import { Calendar, Search, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '@/data/mockData';
import { useState, useRef, useEffect } from 'react';

interface FilterBarProps {
    selectedCategory: string;
    setSelectedCategory: (id: string) => void;
    selectedSubCategory: string | null;
    setSelectedSubCategory: (sub: string | null) => void;
}

export default function FilterBar({
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory
}: FilterBarProps) {
    const [activeDate, setActiveDate] = useState('Bugün');
    const scrollRef = useRef<HTMLDivElement>(null);

    const dates = ['Bugün', 'Yarın', 'Hafta Sonu', 'Bu Ay', 'Tüm Tarihler'];

    const activeCategoryData = CATEGORIES.find(c => c.id === selectedCategory);

    const handleCategoryClick = (id: string) => {
        if (selectedCategory === id) {
            setSelectedCategory('all');
            setSelectedSubCategory(null);
        } else {
            setSelectedCategory(id);
            setSelectedSubCategory(null);
        }
    };

    return (
        <div className="bg-background/95 backdrop-blur-md sticky top-[64px] z-40 border-b border-white/10 py-4 shadow-xl">
            <div className="container mx-auto px-4 flex flex-col gap-4">

                {/* Main Categories - Horizontal Scroll */}
                <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar" ref={scrollRef}>
                    <button
                        onClick={() => handleCategoryClick('all')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap border ${selectedCategory === 'all'
                            ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(245,158,11,0.4)] transform scale-105'
                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <Search className="w-4 h-4" />
                        Tümü
                    </button>

                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap border ${isActive
                                    ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] transform scale-105'
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {cat.name}
                            </button>
                        );
                    })}
                </div>

                {/* Subcategories - Animated Expand */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeCategoryData ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                        <div className="text-sm text-gray-500 font-medium px-2 shrink-0 flex items-center gap-1">
                            <ChevronRight className="w-4 h-4" />
                            Alt Kategori:
                        </div>
                        {activeCategoryData?.sub.map((sub) => (
                            <button
                                key={sub}
                                onClick={() => setSelectedSubCategory(selectedSubCategory === sub ? null : sub)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedSubCategory === sub
                                    ? 'bg-primary/20 text-primary border-primary/50'
                                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {sub}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
