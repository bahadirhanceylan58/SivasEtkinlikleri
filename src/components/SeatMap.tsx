"use client";

import { Check } from 'lucide-react';

export interface Seat {
    row: string;
    number: number;
    section: 'vip' | 'normal';
    status: 'available' | 'selected' | 'sold';
    price: number;
}

interface SeatMapProps {
    seats: Seat[];
    selectedSeats: string[];
    onSeatClick: (seatId: string) => void;
    maxSeats?: number;
}

export default function SeatMap({ seats, selectedSeats, onSeatClick, maxSeats = 10 }: SeatMapProps) {
    const getSeatId = (seat: Seat) => `${seat.row}${seat.number}`;

    const getSeatColor = (seat: Seat) => {
        if (seat.status === 'sold') return 'bg-red-500/20 border-red-500 cursor-not-allowed';
        if (selectedSeats.includes(getSeatId(seat))) return 'bg-blue-500 border-blue-500';
        if (seat.section === 'vip') return 'bg-yellow-500/20 border-yellow-500 hover:bg-yellow-500/40';
        return 'bg-green-500/20 border-green-500 hover:bg-green-500/40';
    };

    const handleSeatClick = (seat: Seat) => {
        if (seat.status === 'sold') return;

        const seatId = getSeatId(seat);
        const isSelected = selectedSeats.includes(seatId);

        // Maksimum koltuk kontrolü
        if (!isSelected && selectedSeats.length >= maxSeats) {
            alert(`En fazla ${maxSeats} koltuk seçebilirsiniz.`);
            return;
        }

        onSeatClick(seatId);
    };

    // Satırlara göre grupla
    const rowGroups = seats.reduce((acc, seat) => {
        if (!acc[seat.row]) acc[seat.row] = [];
        acc[seat.row].push(seat);
        return acc;
    }, {} as Record<string, Seat[]>);

    const sortedRows = Object.keys(rowGroups).sort();

    return (
        <div className="space-y-6">
            {/* Sahne */}
            <div className="bg-gradient-to-b from-neutral-700 to-neutral-800 py-4 rounded-t-3xl text-center">
                <p className="text-white font-bold">🎭 SAHNE</p>
            </div>

            {/* Koltuklar */}
            <div className="space-y-2">
                {sortedRows.map(row => (
                    <div key={row} className="flex items-center gap-2">
                        {/* Satır Etiketi */}
                        <div className="w-8 text-center font-bold text-gray-400">{row}</div>

                        {/* Koltuklar */}
                        <div className="flex gap-1.5 flex-1 justify-center flex-wrap">
                            {rowGroups[row]
                                .sort((a, b) => a.number - b.number)
                                .map((seat) => {
                                    const seatId = getSeatId(seat);
                                    const isSelected = selectedSeats.includes(seatId);

                                    return (
                                        <button
                                            key={seatId}
                                            onClick={() => handleSeatClick(seat)}
                                            disabled={seat.status === 'sold'}
                                            className={`
                        relative w-8 h-8 rounded-md border-2 transition-all duration-200 transform
                        ${getSeatColor(seat)}
                        ${seat.status !== 'sold' ? 'hover:scale-110 cursor-pointer' : ''}
                        ${isSelected ? 'scale-110' : ''}
                      `}
                                            title={`${row}${seat.number} - ${seat.section === 'vip' ? 'VIP' : 'Normal'} - ${seat.price}₺`}
                                        >
                                            <span className="text-xs font-bold text-white">{seat.number}</span>
                                            {isSelected && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 pt-6 border-t border-neutral-700">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-green-500/20 border-2 border-green-500"></div>
                    <span className="text-sm text-gray-400">Boş</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-yellow-500/20 border-2 border-yellow-500"></div>
                    <span className="text-sm text-gray-400">VIP</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-500 border-2 border-blue-500"></div>
                    <span className="text-sm text-gray-400">Seçili</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-red-500/20 border-2 border-red-500"></div>
                    <span className="text-sm text-gray-400">Satıldı</span>
                </div>
            </div>
        </div>
    );
}
