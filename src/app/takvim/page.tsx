'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCalendar from "@/components/EventCalendar";
import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CalendarPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const q = query(collection(db, "events"), orderBy("date", "asc"));
                const querySnapshot = await getDocs(q);
                const firebaseEvents = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setEvents(firebaseEvents);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
            <Navbar />
            <div className="flex-1 container mx-auto px-4 py-8 mt-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-2">
                        Etkinlik Takvimi
                    </h1>
                    <p className="text-muted-foreground">
                        Sivas'taki tüm etkinlikleri aylık takvim üzerinde görüntüleyin ve planınızı yapın.
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <EventCalendar events={events} />
                )}
            </div>
            <Footer />
        </div>
    );
}
