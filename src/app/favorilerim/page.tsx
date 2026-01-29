"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import EventCard from '@/components/EventCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
    const { user, loading } = useAuth();
    const [favorites, setFavorites] = useState<any[]>([]); // Store full event objects
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) return;

            try {
                // 1. Get user's favorite IDs
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (!userDoc.exists() || !userDoc.data().favorites || userDoc.data().favorites.length === 0) {
                    setFavorites([]);
                    setFetching(false);
                    return;
                }

                const favoriteIds = userDoc.data().favorites;

                // 2. Fetch details for each event ID
                // Note: In a production app with many favorites, you might want to use 'in' query in chunks of 10
                // Here we fetch one by one which is fine for < 20 favorites
                const eventsPromises = favoriteIds.map((id: string) => getDoc(doc(db, "events", id)));
                const docSnapshots = await Promise.all(eventsPromises);

                const eventsList = docSnapshots
                    .filter(snap => snap.exists())
                    .map(snap => ({ id: snap.id, ...snap.data() }));

                setFavorites(eventsList);
            } catch (error) {
                console.error("Error fetching favorites:", error);
            } finally {
                setFetching(false);
            }
        };

        if (!loading) {
            if (!user) {
                // User not logged in will be handled by UI
                setFetching(false);
            } else {
                fetchFavorites();
            }
        }
    }, [user, loading]);

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground"><Loader2 className="animate-spin mr-2" /> Yükleniyor...</div>;

    if (!user) {
        return (
            <main className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
                <Navbar />
                <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
                    <Heart className="w-16 h-16 text-muted-foreground mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Favorileri Görüntüle</h1>
                    <p className="text-muted-foreground mb-6">Favori etkinliklerinizi görmek için giriş yapmalısınız.</p>
                    <Link href="/login" className="bg-primary text-black font-bold px-6 py-3 rounded-xl hover:bg-primary-hover transition-colors">
                        Giriş Yap
                    </Link>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
            <Navbar />

            <section className="py-24 flex-grow">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-red-500/20 rounded-full">
                            <Heart className="w-8 h-8 text-red-500 fill-current" />
                        </div>
                        <h1 className="text-3xl font-bold">Favori Etkinliklerim</h1>
                    </div>

                    {fetching ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-[300px] bg-muted/50 rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : favorites.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {favorites.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-muted/30 border border-border rounded-2xl p-12 text-center">
                            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-foreground mb-2">Listeniz Boş</h2>
                            <p className="text-muted-foreground mb-6">Henüz hiç bir etkinliği favorilere eklemediniz.</p>
                            <Link href="/" className="text-primary hover:underline">
                                Etkinlikleri Keşfet
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
