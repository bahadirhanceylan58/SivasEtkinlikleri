'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SeatSelector from '@/components/SeatSelector';
import { SeatingConfig, Seat, VENUE_TEMPLATES, SeatCategory } from '@/types/seating';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Event {
    id: string;
    title: string;
    date: string;
    location: string;
    imageUrl?: string;
    seatingConfig?: SeatingConfig;
}

export default function SeatSelectionPage() {
    const params = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                // User needs to be logged in to select seats
                // However, SeatSelector also checks for user, but we should probably enforce it here too
            } else {
                setUser(currentUser);
            }
        });

        const fetchEvent = async () => {
            if (!params.id) return;
            try {
                const docRef = doc(db, 'events', params.id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setEvent({ id: docSnap.id, ...docSnap.data() } as Event);
                } else {
                    alert('Etkinlik bulunamadı.');
                    router.push('/');
                }
            } catch (error) {
                console.error("Error fetching event:", error);
                alert('Etkinlik bilgileri yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
        return () => unsubscribe();
    }, [params.id, router]);

    const handleProceedToPayment = (selectedSeats: Seat[]) => {
        if (!selectedSeats || selectedSeats.length === 0) {
            alert('Lütfen en az bir koltuk seçin.');
            return;
        }

        // Save to session storage
        sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));

        // Navigate to payment
        router.push(`/odeme/${params.id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!event) return null;

    // Use event's config or fallback to a default template (e.g., theater) if missing but hasSeating is true
    // ensuring we map the raw data to the correct types
    const rawConfig = event.seatingConfig;
    let seatingConfig: SeatingConfig;

    if (rawConfig) {
        seatingConfig = rawConfig;
    } else {
        // Fallback default
        seatingConfig = {
            ...VENUE_TEMPLATES['theater'],
            venueType: 'theater',
            blockedSeats: [],
            categories: VENUE_TEMPLATES['theater'].categories.map((c, i) => ({
                ...c,
                id: `cat-${i}`
            }))
        } as SeatingConfig;
    }

    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            <div className="container mx-auto px-4 py-8 flex-1">
                <Link
                    href={`/etkinlik/${event.id}`}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Etkinlik Detayına Dön
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                    <p className="text-xl text-primary font-medium mb-4">Koltuk Seçimi</p>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <span>
                            {new Date(event.date).toLocaleDateString('tr-TR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                        <span>•</span>
                        <span>{event.location}</span>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-1 shadow-sm">
                    <SeatSelector
                        eventId={event.id}
                        seatingConfig={seatingConfig}
                        onProceedToPayment={handleProceedToPayment}
                    />
                </div>
            </div>

            <Footer />
        </main>
    );
}
