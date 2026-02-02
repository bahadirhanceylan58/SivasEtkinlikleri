'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
    Clock, Users, Calendar, Award, BookOpen, Star,
    ChevronRight, CheckCircle2, Play, Download,
    User, Mail, MapPin, ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import ReviewSection from '@/components/ReviewSection';

interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: 'Başlangıç' | 'Orta' | 'İleri';
    duration: string;
    price: number;
    instructorName: string;
    instructorId?: string;
    instructorBio?: string;
    instructorEmail?: string;
    instructorImage?: string;
    imageUrl: string;
    curriculum?: Array<{
        week: number;
        title: string;
        topics: string[];
    }>;
    learningOutcomes?: string[];
    requirements?: string[];
    maxStudents?: number;
    enrolledCount?: number;
    startDate?: any;
    endDate?: any;
    schedule?: string;
    status?: 'pending' | 'approved' | 'rejected';
    createdAt?: any;
}

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            if (!params.id) return;

            try {
                const courseDoc = await getDoc(doc(db, 'courses', params.id as string));
                if (courseDoc.exists()) {
                    const courseData = { id: courseDoc.id, ...courseDoc.data() } as Course;
                    setCourse(courseData);

                    // Check if user is enrolled
                    if (user) {
                        const enrollmentQuery = query(
                            collection(db, 'course_enrollments'),
                            where('courseId', '==', params.id),
                            where('userId', '==', user.uid)
                        );
                        const enrollmentSnapshot = await getDocs(enrollmentQuery);
                        setIsEnrolled(!enrollmentSnapshot.empty);
                    }
                } else {
                    console.log('Course not found');
                }
            } catch (error) {
                console.error('Error fetching course:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [params.id, user]);

    const handleEnroll = async () => {
        if (!user) {
            alert('Kursa kayıt olmak için lütfen giriş yapın.');
            router.push('/login');
            return;
        }

        if (!course) return;

        setEnrolling(true);
        try {
            await addDoc(collection(db, 'course_enrollments'), {
                courseId: course.id,
                userId: user.uid,
                userName: user.displayName || user.email,
                userEmail: user.email,
                enrolledAt: new Date(),
                status: 'active',
                progress: 0
            });

            setIsEnrolled(true);
            alert('Kursa başarıyla kaydoldunuz!');
        } catch (error) {
            console.error('Error enrolling:', error);
            alert('Kayıt sırasında bir hata oluştu.');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Kurs yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
                    <p className="text-muted-foreground mb-8">Kurs bulunamadı</p>
                    <Link href="/kurslar" className="px-6 py-3 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors">
                        Kurslara Dön
                    </Link>
                </div>
            </div>
        );
    }

    // Show pending message if course is not approved
    if (course.status === 'pending' || course.status === 'rejected') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        {course.status === 'pending' ? 'Onay Bekliyor' : 'Kurs Reddedildi'}
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        {course.status === 'pending'
                            ? 'Bu kurs henüz admin onayından geçmedi.'
                            : 'Bu kurs yönetici tarafından reddedildi.'}
                    </p>
                    <Link href="/kurslar" className="px-6 py-3 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors inline-block">
                        Kurslara Dön
                    </Link>
                </div>
            </div>
        );
    }

    const difficultyColors = {
        'Başlangıç': 'bg-green-500/10 text-green-500',
        'Orta': 'bg-yellow-500/10 text-yellow-500',
        'İleri': 'bg-red-500/10 text-red-500'
    };

    const enrollmentPercentage = course.maxStudents
        ? Math.round(((course.enrolledCount || 0) / course.maxStudents) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-primary/20 via-background to-background border-b border-border">
                <div className="container mx-auto px-4 py-8 sm:py-12">
                    <Link href="/kurslar" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Kurslara Dön
                    </Link>

                    <div className="grid lg:grid-cols-2 gap-8 items-start">
                        {/* Left: Course Info */}
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[course.difficulty]}`}>
                                    {course.difficulty}
                                </span>
                                <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                                    {course.category}
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                                {course.title}
                            </h1>

                            <p className="text-lg text-muted-foreground mb-6">
                                {course.description}
                            </p>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-6 mb-6">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="w-5 h-5 text-primary" />
                                    <span>{course.duration}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="w-5 h-5 text-primary" />
                                    <span>{course.enrolledCount || 0} kayıtlı</span>
                                </div>
                                {course.startDate && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="w-5 h-5 text-primary" />
                                        <span>
                                            {new Date(course.startDate.seconds ? course.startDate.seconds * 1000 : course.startDate).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Instructor */}
                            <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Eğitmen</p>
                                    <p className="font-semibold text-foreground">{course.instructorName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Course Image & Enrollment */}
                        <div>
                            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg sticky top-24">
                                {course.imageUrl && (
                                    <div className="relative w-full aspect-video">
                                        <Image
                                            src={course.imageUrl}
                                            alt={course.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}

                                <div className="p-6">
                                    <div className="flex items-baseline gap-2 mb-6">
                                        {course.price > 0 ? (
                                            <>
                                                <span className="text-4xl font-bold text-foreground">
                                                    {course.price} ₺
                                                </span>
                                                <span className="text-muted-foreground">/ kurs</span>
                                            </>
                                        ) : (
                                            <span className="text-4xl font-bold text-green-500">Ücretsiz</span>
                                        )}
                                    </div>

                                    {/* Enrollment Progress */}
                                    {course.maxStudents && (
                                        <div className="mb-6">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-muted-foreground">Kayıt Durumu</span>
                                                <span className="font-medium text-foreground">
                                                    {course.enrolledCount || 0} / {course.maxStudents}
                                                </span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${enrollmentPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {isEnrolled ? (
                                        <div className="bg-green-500/10 text-green-500 rounded-xl p-4 text-center font-medium mb-4">
                                            <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
                                            Kursa Kayıtlısınız
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleEnroll}
                                            disabled={enrolling || (course.maxStudents ? (course.enrolledCount || 0) >= course.maxStudents : false)}
                                            className="w-full bg-primary text-black font-semibold py-4 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                                        >
                                            {enrolling ? 'Kaydediliyor...' :
                                                (course.maxStudents && (course.enrolledCount || 0) >= course.maxStudents) ? 'Kontenjan Dolu' :
                                                    'Kursa Kaydol'}
                                        </button>
                                    )}

                                    {/* Edit Button for Course Owner */}
                                    {user && course.instructorId === user.uid && (
                                        <Link
                                            href={`/kurslar/duzenle/${course.id}`}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-muted hover:bg-muted/80 border border-border rounded-xl transition-all mb-4 text-foreground font-medium"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Kursu Düzenle
                                        </Link>
                                    )}

                                    <p className="text-xs text-center text-muted-foreground">
                                        30 gün para iade garantisi
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl">
                    {/* Learning Outcomes */}
                    {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                                <Award className="w-6 h-6 text-primary" />
                                Bu Kursta Neler Öğreneceksiniz?
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {course.learningOutcomes.map((outcome, index) => (
                                    <div key={index} className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg">
                                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                        <p className="text-foreground">{outcome}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Curriculum */}
                    {course.curriculum && course.curriculum.length > 0 && (
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-primary" />
                                Müfredat
                            </h2>
                            <div className="space-y-4">
                                {course.curriculum.map((week, index) => (
                                    <details key={index} className="bg-card border border-border rounded-lg overflow-hidden group">
                                        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold">
                                                    {week.week}
                                                </div>
                                                <h3 className="font-semibold text-foreground">{week.title}</h3>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-muted-foreground group-open:rotate-90 transition-transform" />
                                        </summary>
                                        <div className="px-4 pb-4 space-y-2">
                                            {week.topics.map((topic, topicIndex) => (
                                                <div key={topicIndex} className="flex items-center gap-3 p-2 text-muted-foreground">
                                                    <Play className="w-4 h-4 text-primary" />
                                                    <span>{topic}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Requirements */}
                    {course.requirements && course.requirements.length > 0 && (
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-foreground mb-6">Gereksinimler</h2>
                            <div className="bg-card border border-border rounded-lg p-6">
                                <ul className="space-y-3">
                                    {course.requirements.map((req, index) => (
                                        <li key={index} className="flex items-start gap-3 text-foreground">
                                            <ChevronRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                            <span>{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>
                    )}

                    {/* Instructor Bio */}
                    {course.instructorBio && (
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-foreground mb-6">Eğitmen Hakkında</h2>
                            <div className="bg-card border border-border rounded-lg p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="w-8 h-8 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-foreground mb-1">{course.instructorName}</h3>
                                        {course.instructorEmail && (
                                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                                <Mail className="w-4 h-4" />
                                                {course.instructorEmail}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-muted-foreground">{course.instructorBio}</p>
                            </div>
                        </section>
                    )}

                    {/* Reviews Section */}
                    <section>
                        <ReviewSection courseId={course.id} />
                    </section>
                </div>
            </div>
        </div>
    );
}
