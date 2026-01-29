"use client";

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
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
import SeatMap from './SeatMap';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
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

        // Can't select sold or blocked seats - managed by SeatMap UI mostly but safe to check here
        if (seat.status === 'sold' || seat.status === 'blocked') {
            return;
        }

        // Check if reserved by someone else
        if (seat.status === 'reserved' && seat.reservedBy !== user.uid) {
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
            // Max limit check (e.g. 10)
            if (selectedSeats.length >= 10) {
                alert('En fazla 10 koltuk seçebilirsiniz.');
                return;
            }

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
                    setSelectedSeats(selectedSeats); // Revert? actually hook loop will fix it
                }
            }
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
                        <div className="overflow-auto max-h-[600px] flex justify-center">
                            <SeatMap
                                seats={Array.from(seats.values())}
                                selectedSeats={selectedSeats}
                                onSeatClick={handleSeatClick}
                                zoom={zoom}
                                getSeatBorderColor={getSeatBorderColor}
                                maxSeats={10}
                            />
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
