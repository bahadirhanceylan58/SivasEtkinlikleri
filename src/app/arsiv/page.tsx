"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import EventCard from '@/components/EventCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Archive, CalendarClock, History } from 'lucide-react';

export default function ArchivesPage() {
    const [pastEvents, setPastEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPastEvents = async () => {
            try {
                const now = new Date();
                const nowIso = now.toISOString();

                // Ideally we would filter by date < now in query, but date string formats might vary
                // Fetching all (or limit 50) and filtering clientside for robust comparison for this demo
                const q = query(collection(db, "events"), orderBy("date", "desc"));
                const querySnapshot = await getDocs(q);

                const events = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).filter((event: any) => {
                    const eventDate = new Date(event.date);
                    return eventDate < now;
                });

                setPastEvents(events);
            } catch (error) {
                console.error("Error fetching past events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPastEvents();
    }, []);

    return (
        <main className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
            <Navbar />

            <section className="py-24 flex-grow">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-muted rounded-full">
                                <History className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Etkinlik Arşivi</h1>
                                <p className="text-sm text-muted-foreground">Geçmişte düzenlenen etkinlikler</p>
                            </div>
                        </div>
                        <span className="bg-muted text-muted-foreground px-4 py-2 rounded-full text-sm font-medium border border-border">
                            {pastEvents.length} Toplam
                        </span>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-[300px] bg-muted/50 rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : pastEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 opacity-75 hover:opacity-100 transition-opacity">
                            {pastEvents.map((event) => (
                                <div key={event.id} className="relative group grayscale hover:grayscale-0 transition-all duration-500">
                                    <EventCard event={event} />
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="bg-card/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1 rounded uppercase tracking-widest border border-border shadow-sm">
                                            Tamamlandı
                                        </span>
                                    </div>
                                    {/* Overlay on top of image to dim it - Keeping dark for graying out effect */}
                                    <div className="absolute inset-0 bg-background/20 pointer-events-none rounded-2xl z-10 group-hover:bg-transparent transition-colors"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-muted/30 border border-border rounded-2xl p-12 text-center">
                            <Archive className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-foreground mb-2">Arşiv Boş</h2>
                            <p className="text-muted-foreground">Henüz geçmiş bir etkinlik bulunmuyor.</p>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
