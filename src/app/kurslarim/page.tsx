'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import CourseCard, { Course } from '@/components/CourseCard';
import { BookOpen, GraduationCap, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import SkeletonLoader from '@/components/SkeletonLoader';

const KurslarimPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'enrolled' | 'teaching'>('enrolled');
    const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
    const [teachingCourses, setTeachingCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!user) return;

            try {
                setLoading(true);

                // Fetch courses the user is teaching
                const teachingQuery = query(
                    collection(db, 'courses'),
                    where('instructorId', '==', user.uid),
                    orderBy('createdAt', 'desc')
                );
                const teachingSnapshot = await getDocs(teachingQuery);
                const teaching = teachingSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    startDate: doc.data().startDate?.toDate?.() || doc.data().startDate,
                    endDate: doc.data().endDate?.toDate?.() || doc.data().endDate
                })) as Course[];

                setTeachingCourses(teaching);

                // Fetch courses the user is enrolled in
                // First get enrollments
                const enrollmentsQuery = query(
                    collection(db, 'course_enrollments'),
                    where('userId', '==', user.uid)
                );
                const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
                const enrolledCourseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);

                if (enrolledCourseIds.length > 0) {
                    // Then fetch those courses
                    const coursesQuery = query(
                        collection(db, 'courses'),
                        where('__name__', 'in', enrolledCourseIds.slice(0, 10)) // Firestore 'in' limit is 10
                    );
                    const coursesSnapshot = await getDocs(coursesQuery);
                    const enrolled = coursesSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        startDate: doc.data().startDate?.toDate?.() || doc.data().startDate,
                        endDate: doc.data().endDate?.toDate?.() || doc.data().endDate
                    })) as Course[];

                    setEnrolledCourses(enrolled);
                }
            } catch (error) {
                console.error('Kurslar yüklenirken hata:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="glass p-8 rounded-2xl max-w-md text-center">
                    <h2 className="text-2xl font-bold mb-4">Giriş Gerekli</h2>
                    <p className="text-muted-foreground mb-6">Kurslarınızı görmek için giriş yapmalısınız.</p>
                    <Link href="/login" className="px-6 py-3 bg-primary text-black rounded-full font-semibold hover:bg-primary/90 transition-all inline-block">
                        Giriş Yap
                    </Link>
                </div>
            </div>
        );
    }

    const currentCourses = activeTab === 'enrolled' ? enrolledCourses : teachingCourses;

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Kurslarım</h1>
                    <p className="text-muted-foreground">
                        Kayıt olduğunuz ve verdiğiniz kursları yönetin
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-border">
                    <button
                        onClick={() => setActiveTab('enrolled')}
                        className={`px-6 py-3 font-medium transition-all relative ${activeTab === 'enrolled'
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            Kayıt Olduğum Kurslar
                        </div>
                        {activeTab === 'enrolled' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('teaching')}
                        className={`px-6 py-3 font-medium transition-all relative ${activeTab === 'teaching'
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5" />
                            Verdiğim Kurslar
                        </div>
                        {activeTab === 'teaching' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(n => (
                                <SkeletonLoader key={n} />
                            ))}
                        </div>
                    ) : currentCourses.length === 0 ? (
                        <div className="text-center py-16">
                            {activeTab === 'enrolled' ? (
                                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            ) : (
                                <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            )}
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                {activeTab === 'enrolled' ? 'Henüz kursa kayıt olmadınız' : 'Henüz kurs oluşturmadınız'}
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                {activeTab === 'enrolled'
                                    ? 'Size uygun kursları keşfedin ve öğrenmeye başlayın'
                                    : 'Bilginizi paylaşın ve öğrencilere ulaşın'}
                            </p>
                            <Link
                                href={activeTab === 'enrolled' ? '/kurslar' : '/kurslar/olustur'}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-full font-semibold hover:bg-primary/90 transition-all hover:scale-105"
                            >
                                {activeTab === 'enrolled' ? 'Kursları Keşfet' : 'Kurs Oluştur'}
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Status Filter for Teaching Courses */}
                            {activeTab === 'teaching' && teachingCourses.length > 0 && (
                                <div className="mb-6 glass-strong p-4 rounded-lg">
                                    <div className="flex flex-wrap gap-4">
                                        {['pending', 'approved', 'rejected'].map(status => {
                                            const count = teachingCourses.filter(c => c.status === status).length;
                                            if (count === 0) return null;

                                            const statusConfig = {
                                                pending: { label: 'Onay Bekliyor', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30' },
                                                approved: { label: 'Onaylandı', color: 'text-green-500 bg-green-500/10 border-green-500/30' },
                                                rejected: { label: 'Reddedildi', color: 'text-red-500 bg-red-500/10 border-red-500/30' }
                                            };

                                            const config = statusConfig[status as keyof typeof statusConfig];

                                            return (
                                                <div key={status} className={`px-4 py-2 rounded-lg border ${config.color}`}>
                                                    <span className="font-medium">{config.label}:</span>
                                                    <span className="ml-2 font-bold">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Courses Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {currentCourses.map(course => (
                                    <div key={course.id} className="relative">
                                        {/* Status Badge for Teaching Courses */}
                                        {activeTab === 'teaching' && (
                                            <div className="absolute top-4 right-4 z-10">
                                                {course.status === 'pending' && (
                                                    <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-medium rounded-full">
                                                        Onay Bekliyor
                                                    </span>
                                                )}
                                                {course.status === 'approved' && (
                                                    <span className="px-3 py-1 bg-green-500 text-black text-xs font-medium rounded-full">
                                                        Yayında
                                                    </span>
                                                )}
                                                {course.status === 'rejected' && (
                                                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                                                        Reddedildi
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <CourseCard course={course} />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KurslarimPage;
