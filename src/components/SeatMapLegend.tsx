import React from 'react';
import { SeatCategory } from '@/types/seating';

interface SeatMapLegendProps {
    categories: SeatCategory[];
}

export default function SeatMapLegend({ categories }: SeatMapLegendProps) {
    const statuses = [
        { status: 'available', label: 'Boş', color: '#4CAF50' },
        { status: 'selected', label: 'Seçilmiş', color: '#FFC107' },
        { status: 'sold', label: 'Satılmış', color: '#F44336' },
        { status: 'blocked', label: 'Kullanılamaz', color: '#9E9E9E' }
    ];

    return (
        <div className="glass-strong p-4 rounded-xl border border-white/10">
            <h4 className="text-sm font-semibold text-white mb-3">Gösterim</h4>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {statuses.map((item) => (
                    <div key={item.status} className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-md flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-gray-300">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Category Legend */}
            {categories.length > 0 && (
                <>
                    <div className="border-t border-white/10 my-3" />
                    <h4 className="text-sm font-semibold text-white mb-3">Kategoriler</h4>
                    <div className="space-y-2">
                        {categories.map((category) => (
                            <div key={category.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-6 h-6 rounded-md border-2 flex-shrink-0"
                                        style={{ borderColor: category.color }}
                                    />
                                    <span className="text-xs text-gray-300">{category.name}</span>
                                </div>
                                <span className="text-xs font-semibold text-primary">{category.price}₺</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
