"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { SkeletonCard } from "@/components/SkeletonLoader";
import Hero from "@/components/Hero";
import EventFilters from "@/components/EventFilters";
import CourseCard from "@/components/CourseCard";
import type { Course } from "@/components/CourseCard";
import QuickCategories from "@/components/QuickCategories";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Event } from "@/data/mockData";
import { useState, useEffect, Suspense } from "react";
import { collection, getDocs, orderBy, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Sparkles, Calendar } from "lucide-react";

function HomeContent() {
  // Filter State
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    date: 'all',
    minPrice: '',
    maxPrice: ''
  });

  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();

  useEffect(() => {
    // Sync URL search param with filters
    const searchParam = searchParams.get('search');
    if (searchParam !== null && searchParam !== filters.search) {
      setFilters(prev => ({ ...prev, search: searchParam }));
    } else if (searchParam === null && filters.search) {
      setFilters(prev => ({ ...prev, search: '' }));
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch events
        const q = query(collection(db, "events"), where("status", "==", "approved"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const firebaseEvents = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[];

        setAllEvents(firebaseEvents);

        // Fetch approved courses for homepage (simplified query to avoid index)
        const coursesQuery = query(
          collection(db, "courses"),
          where("status", "==", "approved")
        );
        const coursesSnapshot = await getDocs(coursesQuery);
        let coursesData = coursesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[];

        // Sort in memory and take first 3
        coursesData = coursesData
          .sort((a, b) => {
            const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
            const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
            return new Date(bTime).getTime() - new Date(aTime).getTime();
          })
          .slice(0, 3);

        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setAllEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // 1. New Arrivals: Top 4 sorted by createdAt, only approved or legacy
  const newArrivals = [...allEvents]
    .filter(event => !event.status || event.status === 'approved') // Only approved or legacy events
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 4);

  // 2. Upcoming Events: Logic for sorting by date and filtering
  const upcomingEvents = allEvents.filter((event) => {
    // 0. Status Filter - only show approved or legacy events
    if (event.status && event.status !== 'approved') {
      return false;
    }

    // 1. Category Filter
    if (filters.category !== "all") {
      const catMatch = event.category === filters.category;
      const subMatch = event.subCategory === filters.category;
      if (!catMatch && !subMatch) return false;
    }

    // 2. Search Filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = event.title.toLowerCase().includes(searchLower);
      const matchesLoc = event.location.toLowerCase().includes(searchLower);
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
      const minTicketPrice = event.ticketTypes && event.ticketTypes.length > 0
        ? Math.min(...event.ticketTypes.map((t: any) => t.price))
        : 0;

      if (filters.minPrice && minTicketPrice < Number(filters.minPrice)) return false;
      if (filters.maxPrice && minTicketPrice > Number(filters.maxPrice)) return false;
    }

    return true;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground page-transition transition-colors duration-300">
      <Navbar />
      <Hero />
      <QuickCategories setFilters={setFilters} />

      {/* SECTION 1: New Arrivals */}
      <section className="py-12 bg-muted/30 border-b border-border transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Yeni Eklenenler
            </h2>
            <div className="h-1 w-20 bg-primary mt-2 rounded-full shadow-glow"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              // Skeleton loaders
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              newArrivals.map((event, index) => (
                <div
                  key={event.id}
                  className="animate-slideInUp"
                  style={{ animationDelay: `${index * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }}
                >
                  <EventCard event={event} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* SECTION: Popular Courses */}
      <section className="py-12 bg-background border-b border-border transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                Popüler Kurslar
              </h2>
              <div className="h-1 w-20 bg-primary mt-2 rounded-full shadow-glow"></div>
            </div>
            <Link href="/kurslar" className="text-sm text-primary hover:underline flex items-center gap-1">
              Tüm Kurslar
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <>
                <div className="glass-strong p-6 rounded-2xl animate-pulse">
                  <div className="h-48 bg-muted rounded-lgmb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
                <div className="glass-strong p-6 rounded-2xl animate-pulse hidden md:block">
                  <div className="h-48 bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
                <div className="glass-strong p-6 rounded-2xl animate-pulse hidden lg:block">
                  <div className="h-48 bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </>
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <div className="glass-strong p-6 rounded-2xl text-center border border-dashed border-primary/30 col-span-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 text-primary opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <h3 className="font-semibold text-foreground mb-2">Kurslar Yakında!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Eğitmenler şu anda harika kurslar hazırlıyor. Siz de kendi kursunuzu oluşturabilirsiniz!
                </p>
                <Link href="/kurslar/olustur" className="inline-block px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-all text-sm font-medium">
                  Kurs Oluştur
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filter Bar for Upcoming Events */}
      <div className="container mx-auto px-4 -mb-8 relative z-10">
        <EventFilters filters={filters} setFilters={setFilters} />
      </div>

      {/* SECTION 2: Upcoming Events */}
      <section id="etkinlikler" className="py-12 min-h-[50vh] transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-border pb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                {filters.category !== 'all' ? 'Arama Sonuçları' : 'Yaklaşan Etkinlikler'}
              </h2>
              <div className="h-1 w-20 bg-primary mt-2 rounded-full"></div>
            </div>

            <span className="text-sm text-muted-foreground glass px-4 py-2 rounded-full border border-border">
              {upcomingEvents.length} etkinlik bulundu
            </span>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {upcomingEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="animate-slideInUp"
                  style={{ animationDelay: `${index * 0.05}s`, opacity: 0, animationFillMode: 'forwards' }}
                >
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
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
                    className="text-primary hover:underline hover:scale-105 transition-all"
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

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Yükleniyor...</div>}>
      <HomeContent />
    </Suspense>
  );
}

