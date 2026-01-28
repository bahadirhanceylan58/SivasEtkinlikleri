'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SeatingConfig, Seat, SeatCategory } from '@/types/seating';
import {
    getCategoryForRow,
    formatSeatName,
    calculateTotalPrice,
    reserveSeats,
    releaseSeats,
    releaseExpiredReservations
} from '@/lib/seatUtils';
import SeatMapLegend from './SeatMapLegend';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SeatSelectorProps {
    eventId: string;
    seatingConfig: SeatingConfig;
    onSelectionChange?: (seats: Seat[], totalPrice: number) => void;
    onProceedToPayment?: (seats: Seat[]) => void;
}

export default function SeatSelector({
    eventId,
    seatingConfig,
    onSelectionChange,
    onProceedToPayment
}: SeatSelectorProps) {
    const { user } = useAuth();
    const [seats, setSeats] = useState<Map<string, Seat>>(new Map());
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(1);
    const [reservationTimer, setReservationTimer] = useState<number | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);

    // Load seats and set up real-time listener
    useEffect(() => {
        const seatsRef = collection(db, `events/${eventId}/seats`);

        // Release expired reservations first
        releaseExpiredReservations(eventId);

        const unsubscribe = onSnapshot(seatsRef, (snapshot) => {
            const seatsMap = new Map<string, Seat>();
            snapshot.docs.forEach((doc) => {
                const seatData = doc.data() as Seat;
                seatsMap.set(doc.id, seatData);
            });
            setSeats(seatsMap);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [eventId]);

    // Reservation timer countdown
    useEffect(() => {
        if (reservationTimer) {
            const interval = setInterval(() => {
                const remaining = reservationTimer - Date.now();
                if (remaining <= 0) {
                    handleReservationExpiry();
                } else {
                    setTimeRemaining(remaining);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [reservationTimer]);

    // Update parent when selection changes
    useEffect(() => {
        if (onSelectionChange) {
            const totalPrice = calculateTotalPrice(selectedSeats);
            onSelectionChange(selectedSeats, totalPrice);
        }
    }, [selectedSeats, onSelectionChange]);

    const handleReservationExpiry = async () => {
        if (selectedSeats.length > 0 && user) {
            await releaseSeats(eventId, selectedSeats.map(s => s.id));
            setSelectedSeats([]);
            setReservationTimer(null);
            alert('Rezervasyon süresi doldu. Lütfen tekrar seçim yapın.');
        }
    };

    const handleSeatClick = async (seat: Seat) => {
        if (!user) {
            alert('Koltuk seçmek için giriş yapmalısınız.');
            return;
        }

        // Can't select sold or blocked seats
        if (seat.status === 'sold' || seat.status === 'blocked') {
            return;
        }

        // Check if already selected
        const isSelected = selectedSeats.some(s => s.id === seat.id);

        if (isSelected) {
            // Deselect
            const updatedSeats = selectedSeats.filter(s => s.id !== seat.id);
            setSelectedSeats(updatedSeats);

            // Release this seat
            await releaseSeats(eventId, [seat.id]);

            // If no seats selected, clear timer
            if (updatedSeats.length === 0) {
                setReservationTimer(null);
            }
        } else {
            // Select (only if available)
            if (seat.status === 'available') {
                const updatedSeats = [...selectedSeats, seat];
                setSelectedSeats(updatedSeats);

                // Reserve the seat
                const success = await reserveSeats(eventId, [seat.id], user.uid);

                if (success) {
                    // Start/update reservation timer (15 minutes)
                    if (!reservationTimer) {
                        const expiryTime = Date.now() + 15 * 60 * 1000;
                        setReservationTimer(expiryTime);
                    }
                } else {
                    // Failed to reserve (someone else might have taken it)
                    alert('Bu koltuk başka biri tarafından alındı. Lütfen başka koltuk seçin.');
                    setSelectedSeats(selectedSeats);
                }
            }
        }
    };

    const getSeatStatus = (seat: Seat): string => {
        if (seat.status === 'blocked') return 'blocked';
        if (seat.status === 'sold') return 'sold';
        if (selectedSeats.some(s => s.id === seat.id)) return 'selected';
        if (seat.status === 'reserved' && seat.reservedBy !== user?.uid) return 'sold'; // Show as sold if reserved by someone else
        return 'available';
    };

    const getSeatColor = (seat: Seat): string => {
        const status = getSeatStatus(seat);

        switch (status) {
            case 'available':
                return '#4CAF50'; // Green
            case 'selected':
                return '#FFC107'; // Yellow
            case 'sold':
                return '#F44336'; // Red
            case 'blocked':
                return '#9E9E9E'; // Gray
            default:
                return '#4CAF50';
        }
    };

    const getSeatBorderColor = (seat: Seat): string | undefined => {
        const category = seatingConfig.categories.find(c => c.id === seat.category);
        return category?.color;
    };

    const handleZoomIn = () => setZoom(Math.min(zoom + 0.2, 2));
    const handleZoomOut = () => setZoom(Math.max(zoom - 0.2, 0.5));
    const handleResetZoom = () => setZoom(1);

    const handleProceed = () => {
        if (onProceedToPayment && selectedSeats.length > 0) {
            onProceedToPayment(selectedSeats);
        }
    };

    if (loading) {
        return (
            <div className="glass-strong p-8 rounded-2xl border border-white/10">
                <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Koltuklar yükleniyor...</p>
                </div>
            </div>
        );
    }

    // Organize seats by rows
    const seatsByRow = new Map<number, Seat[]>();
    Array.from(seats.values()).forEach(seat => {
        if (!seatsByRow.has(seat.row)) {
            seatsByRow.set(seat.row, []);
        }
        seatsByRow.get(seat.row)!.push(seat);
    });

    // Sort seats in each row
    seatsByRow.forEach(rowSeats => {
        rowSeats.sort((a, b) => a.seat - b.seat);
    });

    const totalPrice = calculateTotalPrice(selectedSeats);

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between glass-strong p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleZoomOut}
                        className="p-2 glass hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Zoom out"
                    >
                        <ZoomOut className="w-5 h-5 text-white" />
                    </button>
                    <button
                        onClick={handleResetZoom}
                        className="p-2 glass hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Reset zoom"
                    >
                        <RotateCcw className="w-5 h-5 text-white" />
                    </button>
                    <button
                        onClick={handleZoomIn}
                        className="p-2 glass hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Zoom in"
                    >
                        <ZoomIn className="w-5 h-5 text-white" />
                    </button>
                    <span className="text-sm text-gray-400 ml-2">{Math.round(zoom * 100)}%</span>
                </div>

                {reservationTimer && (
                    <div className="text-sm">
                        <span className="text-gray-400">Kalan süre: </span>
                        <span className="text-primary font-semibold">
                            {Math.floor(timeRemaining / 60000)}:{String(Math.floor((timeRemaining % 60000) / 1000)).padStart(2, '0')}
                        </span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Seat Map */}
                <div className="lg:col-span-3">
                    <div className="glass-strong p-6 rounded-2xl border border-white/10 overflow-hidden">
                        {/* Stage */}
                        <div className="text-center mb-6">
                            <div className="inline-block px-8 py-3 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg border border-primary/30">
                                <span className="text-2xl">🎭</span>
                                <span className="ml-3 font-bold text-white">SAHNE</span>
                            </div>
                        </div>

                        {/* Seats */}
                        <div className="overflow-auto max-h-[600px]">
                            <div
                                style={{
                                    transform: `scale(${zoom})`,
                                    transformOrigin: 'top center',
                                    transition: 'transform 0.2s'
                                }}
                            >
                                <div className="inline-block min-w-full">
                                    {Array.from(seatsByRow.entries())
                                        .sort(([rowA], [rowB]) => rowA - rowB)
                                        .map(([rowNumber, rowSeats]) => {
                                            const category = getCategoryForRow(rowNumber, seatingConfig.categories);

                                            return (
                                                <div key={rowNumber} className="flex items-center gap-2 mb-2">
                                                    {/* Row Label */}
                                                    <div className="w-12 text-center flex-shrink-0">
                                                        <span className="text-xs font-semibold text-gray-400">
                                                            {rowNumber}
                                                        </span>
                                                    </div>

                                                    {/* Seats */}
                                                    <div className="flex gap-1 flex-1 justify-center">
                                                        {rowSeats.map((seat) => {
                                                            const status = getSeatStatus(seat);
                                                            const isClickable = status === 'available' || status === 'selected';

                                                            return (
                                                                <button
                                                                    key={seat.id}
                                                                    onClick={() => handleSeatClick(seat)}
                                                                    disabled={!isClickable}
                                                                    className={`
                                                                        w-8 h-8 rounded-t-md rounded-b-sm text-xs font-semibold
                                                                        transition-all duration-200
                                                                        ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-50'}
                                                                        ${status === 'selected' ? 'ring-2 ring-primary ring-offset-2 ring-offset-black' : ''}
                                                                    `}
                                                                    style={{
                                                                        backgroundColor: getSeatColor(seat),
                                                                        borderTop: `3px solid ${getSeatBorderColor(seat) || 'transparent'}`,
                                                                        color: status === 'selected' ? '#000' : '#fff'
                                                                    }}
                                                                    title={`${formatSeatName(seat)} - ${seat.price}₺`}
                                                                >
                                                                    {seat.seat}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Category Label */}
                                                    <div className="w-24 text-right flex-shrink-0">
                                                        {category && (
                                                            <span
                                                                className="text-xs font-semibold px-2 py-1 rounded"
                                                                style={{
                                                                    backgroundColor: `${category.color}20`,
                                                                    color: category.color
                                                                }}
                                                            >
                                                                {category.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Legend */}
                    <SeatMapLegend categories={seatingConfig.categories} />

                    {/* Selected Seats Summary */}
                    <div className="glass-strong p-4 rounded-xl border border-white/10">
                        <h4 className="text-sm font-semibold text-white mb-3">
                            Seçili Koltuklar ({selectedSeats.length})
                        </h4>

                        {selectedSeats.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4">
                                Henüz koltuk seçilmedi
                            </p>
                        ) : (
                            <>
                                <div className="space-y-2 max-h-40 overflow-auto mb-3">
                                    {selectedSeats.map((seat) => (
                                        <div
                                            key={seat.id}
                                            className="flex items-center justify-between text-xs p-2 glass rounded border border-white/5"
                                        >
                                            <span className="text-gray-300">{formatSeatName(seat)}</span>
                                            <span className="text-primary font-semibold">{seat.price}₺</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-white/10 pt-3 mb-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-white">Toplam</span>
                                        <span className="font-bold text-primary text-lg">{totalPrice}₺</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleProceed}
                                    className="w-full px-4 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all shadow-glow"
                                >
                                    Ödemeye Geç
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
