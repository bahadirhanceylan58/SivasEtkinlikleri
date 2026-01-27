"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import Hero from "@/components/Hero";
import EventFilters from "@/components/EventFilters";
import { Event } from "@/data/mockData"; // Keeping Event interface, removing EVENTS
import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Sparkles, Calendar } from "lucide-react";

export default function Home() {
  // Filter State
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    date: 'all',
    minPrice: '',
    maxPrice: ''
  });

  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const firebaseEvents = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[];

        setAllEvents(firebaseEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        setAllEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // 1. New Arrivals: Top 4 sorted by createdAt
  const newArrivals = [...allEvents]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 4);

  // 2. Upcoming Events: Logic for sorting by date and filtering
  const upcomingEvents = allEvents.filter((event) => {
    // 1. Category Filter
    // Note: EventFilters component passes subcategory ID for specific subs, or parent ID for groups.
    // Simplifying match logic: if filter is 'all', pass. If event.category or event.subCategory includes filter string (naive match)
    // Better approach: Check if filter matches category ID OR subcategory name
    if (filters.category !== "all") {
      // Ideally we match ID, but for subcategories we might only have names in mock data. 
      // Let's assume filter value matches event.category (parent) or event.subCategory
      const catMatch = event.category === filters.category;
      const subMatch = event.subCategory === filters.category;
      if (!catMatch && !subMatch) return false;
    }

    // 2. Search Filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = event.title.toLowerCase().includes(searchLower);
      const matchesLoc = event.location.toLowerCase().includes(searchLower);
      // const matchesArtist = ... if we had artist field
      if (!matchesTitle && !matchesLoc) return false;
    }

    // 3. Date Filter
    if (filters.date !== 'all') {
      const eventDate = new Date(event.date);
      const today = new Date();
      const isToday = eventDate.getDate() === today.getDate() && eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear();

      if (filters.date === 'today' && !isToday) return false;

      if (filters.date === 'weekend') {
        const day = eventDate.getDay();
        if (day !== 0 && day !== 6) return false; // 0=Sunday, 6=Saturday
      }

      if (filters.date === 'week') {
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        if (eventDate < today || eventDate > nextWeek) return false;
      }
    }

    // 4. Price Filter
    if (filters.minPrice || filters.maxPrice) {
      // Find cheapest ticket price
      const minTicketPrice = event.ticketTypes && event.ticketTypes.length > 0
        ? Math.min(...event.ticketTypes.map((t: any) => t.price))
        : 0;

      if (filters.minPrice && minTicketPrice < Number(filters.minPrice)) return false;
      if (filters.maxPrice && minTicketPrice > Number(filters.maxPrice)) return false;
    }

    return true;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Navbar />
      <Hero />

      {/* SECTION 1: New Arrivals */}
      <section className="py-12 bg-neutral-900/50 border-b border-neutral-800">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              Yeni Eklenenler
            </h2>
            <div className="h-1 w-24 bg-primary mt-2 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivals.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* Filter Bar for Upcoming Events */}
      <div className="container mx-auto px-4 -mb-8 relative z-10">
        <EventFilters filters={filters} setFilters={setFilters} />
      </div>

      {/* SECTION 2: Upcoming Events */}
      <section id="etkinlikler" className="py-12 min-h-[50vh]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-6 h-6 text-gray-400" />
                {filters.category !== 'all' ? 'Arama Sonuçları' : 'Yaklaşan Etkinlikler'}
              </h2>
              <div className="h-1 w-full md:w-48 bg-white/10 mt-2 rounded-full relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-1/3 bg-primary/50"></div>
              </div>
            </div>

            <span className="text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              {upcomingEvents.length} etkinlik bulundu
            </span>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              {loading ? (
                <p className="text-xl font-medium mb-2 animate-pulse">Etkinlikler yükleniyor...</p>
              ) : (
                <>
                  <p className="text-xl font-medium mb-2">Henüz aktif etkinlik yok.</p>
                  <button
                    onClick={() => {
                      setFilters({
                        search: '',
                        category: 'all',
                        date: 'all',
                        minPrice: '',
                        maxPrice: ''
                      });
                    }}
                    className="text-primary hover:underline"
                  >
                    Filtreleri Temizle
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main >
  );
}

