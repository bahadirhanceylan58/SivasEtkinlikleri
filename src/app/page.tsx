"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import Hero from "@/components/Hero";
import FilterBar from "@/components/FilterBar";
import { Event } from "@/data/mockData"; // Keeping Event interface, removing EVENTS
import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Sparkles, Calendar } from "lucide-react";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
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
    // 1. Filter by Main Category
    if (selectedCategory !== "all" && event.category !== selectedCategory) {
      return false;
    }

    // 2. Filter by Sub Category
    if (selectedSubCategory && event.subCategory !== selectedSubCategory) {
      return false;
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
      <FilterBar
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSubCategory={selectedSubCategory}
        setSelectedSubCategory={setSelectedSubCategory}
      />

      {/* SECTION 2: Upcoming Events */}
      <section id="etkinlikler" className="py-12 min-h-[50vh]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-6 h-6 text-gray-400" />
                {selectedCategory === "all"
                  ? "Yaklaşan Etkinlikler"
                  : selectedSubCategory
                    ? `${selectedSubCategory} Etkinlikleri`
                    : "Kategori Sonuçları"}
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
                      setSelectedCategory("all");
                      setSelectedSubCategory(null);
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
    </main>
  );
}

