"use client";

import { Check, Lock } from 'lucide-react';
import { Seat } from '@/types/seating';

export interface SeatMapProps {
    seats: Seat[];
    selectedSeats: Seat[];
    onSeatClick: (seat: Seat) => void;
    maxSeats?: number;
    zoom?: number;
    getSeatBorderColor?: (seat: Seat) => string | undefined;
}

export default function SeatMap({
    seats,
    selectedSeats,
    onSeatClick,
    maxSeats = 10,
    zoom = 1,
    getSeatBorderColor
}: SeatMapProps) {

    const getSeatId = (seat: Seat) => seat.id;
    const isSeatSelected = (seat: Seat) => selectedSeats.some(s => s.id === seat.id);

    const getSeatStatus = (seat: Seat): string => {
        if (seat.status === 'blocked') return 'blocked';
        if (seat.status === 'sold') return 'sold';
        if (isSeatSelected(seat)) return 'selected';
        // Check if reserved by someone else is handled by parent passing 'sold' or check here if we had user context
        // Ideally parent transforms data to 'sold' if it's reserved by others
        if (seat.status === 'reserved') return 'sold';
        return 'available';
    };

    const getSeatColor = (seat: Seat) => {
        const status = getSeatStatus(seat);
        switch (status) {
            case 'sold': return 'bg-red-500/20 border-red-500 cursor-not-allowed';
            case 'blocked': return 'bg-gray-500/20 border-gray-500 cursor-not-allowed';
            case 'selected': return 'bg-blue-500 border-blue-500';
            // Use category color if possible, or default green
            default: return 'bg-green-500/20 border-green-500 hover:bg-green-500/40 hover:scale-110 cursor-pointer';
        }
    };

    // Explicit color style override if needed (e.g. for selection or special states not covered by classes)
    const getSeatStyle = (seat: Seat) => {
        const status = getSeatStatus(seat);
        if (status === 'selected') return { color: '#000' };
        if (getSeatBorderColor) {
            return { borderTopColor: getSeatBorderColor(seat) || 'transparent' };
        }
        return {};
    };

    const handleSeatClick = (seat: Seat) => {
        if (seat.status === 'sold' || seat.status === 'blocked') return;

        const isSelected = isSeatSelected(seat);
        if (!isSelected && selectedSeats.length >= maxSeats) {
            // Let parent handle alert? Or do it here if simple. 
            // SeatSelector does alert, so we might duplicate or rely on onSeatClick checks return value?
            // Since onSeatClick is void, we should valid here or let parent handle everything.
            // But for UI visual feedback, let's just pass click.
        }

        onSeatClick(seat);
    };

    // Group by rows
    const rowGroups = seats.reduce((acc, seat) => {
        if (!acc[seat.row]) acc[seat.row] = [];
        acc[seat.row].push(seat);
        return acc;
    }, {} as Record<string, Seat[]>);

    const sortedRows = Object.keys(rowGroups).map(Number).sort((a, b) => a - b);

    return (
        <div
            className="space-y-2 origin-top transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
        >
            {sortedRows.map(row => (
                <div key={row} className="flex items-center gap-2">
                    {/* Row Label */}
                    <div className="w-8 text-center font-bold text-gray-400 text-xs">{row}</div>

                    {/* Seats */}
                    <div className="flex gap-1.5 flex-1 justify-center flex-wrap">
                        {rowGroups[row]
                            .sort((a, b) => a.seat - b.seat) // Sort by seat number
                            .map((seat) => {
                                const isSelected = isSeatSelected(seat);
                                const status = getSeatStatus(seat);
                                const isClickable = status === 'available' || status === 'selected';

                                return (
                                    <button
                                        key={seat.id}
                                        onClick={() => handleSeatClick(seat)}
                                        disabled={!isClickable}
                                        className={`
                                            relative w-8 h-8 rounded-md border-2 transition-all duration-200 transform
                                            flex items-center justify-center
                                            ${getSeatColor(seat)}
                                            ${isSelected ? 'scale-110' : ''}
                                        `}
                                        style={getSeatStyle(seat)}
                                        title={`Row ${seat.row} Seat ${seat.seat} - ${seat.price}₺`}
                                    >
                                        {status === 'blocked' ? (
                                            <Lock className="w-3 h-3 text-gray-400" />
                                        ) : (
                                            <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-white'}`}>
                                                {seat.seat}
                                            </span>
                                        )}

                                        {isSelected && (
                                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center z-10 border border-black">
                                                <Check className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                    </div>
                </div>
            ))}
        </div>
    );
}
