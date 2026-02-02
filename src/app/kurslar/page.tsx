'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import CourseCard, { Course } from '@/components/CourseCard';
import { Search, Filter, PlusCircle, BookOpen, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import SkeletonLoader from '@/components/SkeletonLoader';

const KurslarPage = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
    const [selectedPriceFilter, setSelectedPriceFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('newest');

    const categories = [
        'Tümü',
        'Yazılım',
        'Dil',
        'Sanat',
        'Spor',
        'Müzik',
        'İş ve Girişimcilik',
        'Kişisel Gelişim',
        'Diğer'
    ];

    const difficulties = ['Tümü', 'Başlangıç', 'Orta', 'İleri'];

    // Fetch courses
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const coursesRef = collection(db, 'courses');
                const q = query(
                    coursesRef,
                    where('status', '==', 'approved')
                );

                const snapshot = await getDocs(q);
                let coursesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    startDate: doc.data().startDate?.toDate?.() || doc.data().startDate,
                    endDate: doc.data().endDate?.toDate?.() || doc.data().endDate
                })) as Course[];

                // Sort in memory to avoid compound index
                coursesData = coursesData.sort((a, b) => {
                    const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
                    const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
                    return new Date(bTime).getTime() - new Date(aTime).getTime();
                });

                setCourses(coursesData);
                setFilteredCourses(coursesData);
            } catch (error) {
                console.error('Kurslar yüklenirken hata:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // Filter and sort courses
    useEffect(() => {
        let result = [...courses];

        // Search filter
        if (searchQuery) {
            result = result.filter(course =>
                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.instructorName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory !== 'all' && selectedCategory !== 'Tümü') {
            result = result.filter(course => course.category === selectedCategory);
        }

        // Difficulty filter
        if (selectedDifficulty !== 'all' && selectedDifficulty !== 'Tümü') {
            result = result.filter(course => course.difficulty === selectedDifficulty);
        }

        // Price filter
        if (selectedPriceFilter === 'free') {
            result = result.filter(course => course.price === 0);
        } else if (selectedPriceFilter === 'paid') {
            result = result.filter(course => course.price > 0);
        }

        // Sort
        switch (sortBy) {
            case 'newest':
                result.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
                break;
            case 'popular':
                result.sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0));
                break;
            case 'rating':
                result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'price-low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                result.sort((a, b) => b.price - a.price);
                break;
        }

        setFilteredCourses(result);
    }, [courses, searchQuery, selectedCategory, selectedDifficulty, selectedPriceFilter, sortBy]);

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-16 bg-gradient-to-br from-primary/10 via-background to-background">
                <div className="container mx-auto px-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Ana Sayfa</span>
                    </Link>
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-block mb-4 px-4 py-2 bg-primary/20 rounded-full">
                            <BookOpen className="w-6 h-6 text-primary inline-block mr-2" />
                            <span className="text-primary font-semibold">Kurslar</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Kendinizi Geliştirin
                        </h1>
                        <p className="text-lg text-muted-foreground mb-8">
                            Sivas&apos;ta düzenlenen kurslarla yeni beceriler edinin veya kendi kursunuzu oluşturun
                        </p>

                        {user && (
                            <Link href="/kurslar/olustur">
                                <button className="px-6 py-3 bg-primary text-black rounded-full font-semibold hover:bg-primary/90 transition-all hover:scale-105 inline-flex items-center gap-2">
                                    <PlusCircle className="w-5 h-5" />
                                    Kurs Oluştur
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Filters Section */}
            <section className="sticky top-16 z-30 bg-background/80 backdrop-blur-lg border-b border-border shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Kurs ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                            />
                        </div>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat === 'Tümü' ? 'all' : cat}>{cat}</option>
                            ))}
                        </select>

                        {/* Difficulty Filter */}
                        <select
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            className="px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        >
                            {difficulties.map(diff => (
                                <option key={diff} value={diff === 'Tümü' ? 'all' : diff}>{diff}</option>
                            ))}
                        </select>

                        {/* Price Filter */}
                        <select
                            value={selectedPriceFilter}
                            onChange={(e) => setSelectedPriceFilter(e.target.value)}
                            className="px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        >
                            <option value="all">Tüm Fiyatlar</option>
                            <option value="free">Ücretsiz</option>
                            <option value="paid">Ücretli</option>
                        </select>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        >
                            <option value="newest">En Yeni</option>
                            <option value="popular">En Popüler</option>
                            <option value="rating">En Yüksek Puan</option>
                            <option value="price-low">Fiyat (Düşükten Yükseğe)</option>
                            <option value="price-high">Fiyat (Yüksekten Düşüğe)</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Courses Grid */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-muted-foreground">
                            <span className="font-semibold text-foreground">{filteredCourses.length}</span> kurs bulundu
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(n => (
                                <SkeletonLoader key={n} />
                            ))}
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="text-center py-16">
                            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">Kurs bulunamadı</h3>
                            <p className="text-muted-foreground mb-6">
                                Aradığınız kriterlere uygun kurs bulunamadı. Filtreleri değiştirmeyi deneyin.
                            </p>
                            {user && (
                                <Link href="/kurslar/olustur">
                                    <button className="px-6 py-3 bg-primary text-black rounded-full font-semibold hover:bg-primary/90 transition-all hover:scale-105 inline-flex items-center gap-2">
                                        <PlusCircle className="w-5 h-5" />
                                        İlk Kursu Siz Oluşturun
                                    </button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCourses.map(course => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default KurslarPage;
