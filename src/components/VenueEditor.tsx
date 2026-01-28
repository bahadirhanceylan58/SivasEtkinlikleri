'use client';

import React, { useState, useEffect } from 'react';
import { SeatingConfig, SeatCategory, VENUE_TEMPLATES } from '@/types/seating';
import { Plus, X, Eye } from 'lucide-react';

interface VenueEditorProps {
    config: SeatingConfig | null;
    onChange: (config: SeatingConfig) => void;
}

export default function VenueEditor({ config, onChange }: VenueEditorProps) {
    const [venueType, setVenueType] = useState<string>(config?.venueType || 'theater');
    const [rows, setRows] = useState(config?.rows || 20);
    const [seatsPerRow, setSeatsPerRow] = useState(config?.seatsPerRow || 30);
    const [categories, setCategories] = useState<SeatCategory[]>(config?.categories || []);
    const [showPreview, setShowPreview] = useState(false);

    // Load template when venue type changes
    useEffect(() => {
        if (venueType && venueType !== 'custom' && VENUE_TEMPLATES[venueType]) {
            const template = VENUE_TEMPLATES[venueType];
            setRows(template.rows);
            setSeatsPerRow(template.seatsPerRow);

            const templatedCategories = template.categories.map((cat, index) => ({
                id: `cat_${Date.now()}_${index}`,
                ...cat
            }));
            setCategories(templatedCategories);
        }
    }, [venueType]);

    // Update parent when config changes
    useEffect(() => {
        const newConfig: SeatingConfig = {
            venueType: venueType as any,
            rows,
            seatsPerRow,
            categories,
            blockedSeats: config?.blockedSeats || []
        };
        onChange(newConfig);
    }, [venueType, rows, seatsPerRow, categories]);

    const addCategory = () => {
        const newCategory: SeatCategory = {
            id: `cat_${Date.now()}`,
            name: 'Yeni Kategori',
            color: '#3498DB',
            price: 100,
            rows: []
        };
        setCategories([...categories, newCategory]);
    };

    const updateCategory = (index: number, field: keyof SeatCategory, value: any) => {
        const updated = [...categories];
        if (field === 'rows' && typeof value === 'string') {
            // Parse comma-separated row numbers
            updated[index][field] = value.split(',').map(r => parseInt(r.trim())).filter(r => !isNaN(r));
        } else {
            (updated[index] as any)[field] = value;
        }
        setCategories(updated);
    };

    const removeCategory = (index: number) => {
        setCategories(categories.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            {/* Template Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Salon Şablonu
                </label>
                <select
                    value={venueType}
                    onChange={(e) => setVenueType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none"
                >
                    <option value="theater">🎭 Tiyatro (20x30)</option>
                    <option value="concert_hall">🎵 Konser Salonu (30x50)</option>
                    <option value="stadium">🏟️ Stadyum (40x80)</option>
                    <option value="conference">💼 Konferans Salonu (15x25)</option>
                    <option value="custom">⚙️ Özel</option>
                </select>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Sıra Sayısı
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={rows}
                        onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Sıra Başına Koltuk
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="200"
                        value={seatsPerRow}
                        onChange={(e) => setSeatsPerRow(parseInt(e.target.value) || 1)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none"
                    />
                </div>
            </div>

            {/* Categories */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-300">
                        Koltuk Kategorileri
                    </label>
                    <button
                        onClick={addCategory}
                        className="flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm font-semibold"
                    >
                        <Plus className="w-4 h-4" />
                        Kategori Ekle
                    </button>
                </div>

                <div className="space-y-3">
                    {categories.map((category, index) => (
                        <div
                            key={category.id}
                            className="glass p-4 rounded-xl border border-white/10"
                        >
                            <div className="grid grid-cols-12 gap-3 items-start">
                                {/* Name */}
                                <div className="col-span-3">
                                    <input
                                        type="text"
                                        value={category.name}
                                        onChange={(e) => updateCategory(index, 'name', e.target.value)}
                                        placeholder="Kategori Adı"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-primary focus:outline-none"
                                    />
                                </div>

                                {/* Color */}
                                <div className="col-span-2">
                                    <input
                                        type="color"
                                        value={category.color}
                                        onChange={(e) => updateCategory(index, 'color', e.target.value)}
                                        className="w-full h-10 bg-white/5 border border-white/10 rounded-lg cursor-pointer"
                                    />
                                </div>

                                {/* Price */}
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        min="0"
                                        value={category.price}
                                        onChange={(e) => updateCategory(index, 'price', parseInt(e.target.value) || 0)}
                                        placeholder="Fiyat"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-primary focus:outline-none"
                                    />
                                </div>

                                {/* Rows */}
                                <div className="col-span-4">
                                    <input
                                        type="text"
                                        value={category.rows.join(', ')}
                                        onChange={(e) => updateCategory(index, 'rows', e.target.value)}
                                        placeholder="Sıralar (1,2,3)"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-primary focus:outline-none"
                                    />
                                </div>

                                {/* Remove */}
                                <div className="col-span-1 flex justify-end">
                                    <button
                                        onClick={() => removeCategory(index)}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        aria-label="Kategoriyi Sil"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {categories.length === 0 && (
                        <div className="text-center py-8 glass rounded-xl border border-white/10">
                            <p className="text-gray-400 text-sm">Henüz kategori eklenmedi</p>
                            <p className="text-gray-500 text-xs mt-1">En az bir kategori eklemelisiniz</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="glass p-4 rounded-xl border border-white/10">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-primary">{rows * seatsPerRow}</div>
                        <div className="text-xs text-gray-400">Toplam Koltuk</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-primary">{categories.length}</div>
                        <div className="text-xs text-gray-400">Kategori</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-primary">{rows}</div>
                        <div className="text-xs text-gray-400">Sıra</div>
                    </div>
                </div>
            </div>

            {/* Preview Toggle */}
            <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 glass border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
            >
                <Eye className="w-5 h-5" />
                {showPreview ? 'Önizlemeyi Gizle' : 'Önizlemeyi Göster'}
            </button>

            {/* Preview */}
            {showPreview && (
                <div className="glass p-6 rounded-xl border border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-4">Salon Önizlemesi</h4>
                    <div className="overflow-auto max-h-96">
                        <div className="text-center mb-4">
                            <div className="inline-block px-6 py-2 bg-primary/20 rounded-lg border border-primary/30">
                                <span className="text-primary font-bold text-sm">SAHNE</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            {Array.from({ length: Math.min(rows, 10) }, (_, rowIndex) => {
                                const rowNumber = rowIndex + 1;
                                const category = categories.find(c => c.rows.includes(rowNumber));

                                return (
                                    <div key={rowIndex} className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400 w-8">{rowNumber}</span>
                                        <div className="flex gap-0.5 flex-1 justify-center">
                                            {Array.from({ length: Math.min(seatsPerRow, 20) }, (_, seatIndex) => (
                                                <div
                                                    key={seatIndex}
                                                    className="w-3 h-3 rounded-sm"
                                                    style={{
                                                        backgroundColor: category?.color || '#666',
                                                        opacity: 0.7
                                                    }}
                                                />
                                            ))}
                                            {seatsPerRow > 20 && (
                                                <span className="text-xs text-gray-500 ml-1">...</span>
                                            )}
                                        </div>
                                        {category && (
                                            <span
                                                className="text-xs px-2 py-0.5 rounded"
                                                style={{
                                                    backgroundColor: `${category.color}20`,
                                                    color: category.color
                                                }}
                                            >
                                                {category.name}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                            {rows > 10 && (
                                <div className="text-center py-2 text-xs text-gray-500">
                                    ... ve {rows - 10} sıra daha
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
