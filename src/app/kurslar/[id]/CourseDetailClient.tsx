'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
    Clock, Users, Calendar, Award, BookOpen, Star,
    ChevronRight, CheckCircle2, Play, Download,
    User, Mail, ArrowLeft, X, Phone, Share2,
    List, PlayCircle, MessageCircle, FileText
} from 'lucide-react';
import Image from 'next/image';
import ReviewSection from '@/components/ReviewSection';
import ViewTracker from '@/components/ViewTracker';
import FavoriteButton from '@/components/FavoriteButton';
import CourseCard from '@/components/CourseCard';
import QuestionSection from '@/components/QuestionSection';

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
    whatsapp?: string;
    contactEmail?: string;
}

interface CourseDetailClientProps {
    id: string;
}

export default function CourseDetailClient({ id }: CourseDetailClientProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [instructorCourses, setInstructorCourses] = useState<any[]>([]);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [phone, setPhone] = useState("");
    const [note, setNote] = useState("");

    const handleShare = async () => {
        try {
            await navigator.share({ title: course?.title, url: window.location.href });
        } catch {
            navigator.clipboard.writeText(window.location.href);
            alert('Link kopyalandı!');
        }
    };

    useEffect(() => {
        const fetchCourse = async () => {
            if (!id) return;

            try {
                const courseDoc = await getDoc(doc(db, 'courses', id));
                if (courseDoc.exists()) {
                    const courseData = { id: courseDoc.id, ...courseDoc.data() } as Course;
                    setCourse(courseData);

                    // Check if user is enrolled
                    if (user) {
                        const enrollmentQuery = query(
                            collection(db, 'course_enrollments'),
                            where('courseId', '==', id),
                            where('userId', '==', user.uid)
                        );
                        const enrollmentSnapshot = await getDocs(enrollmentQuery);
                        if (!enrollmentSnapshot.empty) {
                            setIsEnrolled(true);
                            setEnrollmentId(enrollmentSnapshot.docs[0].id);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching course:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id, user]);

    // Modal açılışı
    const openRegistrationModal = () => {
        if (!user) {
            alert('Kursa kayıt olmak için lütfen giriş yapın.');
            router.push('/login');
            return;
        }
        setShowModal(true);
    };

    const handleRegister = async () => {
        if (!phone) {
            alert("Lütfen telefon numaranızı giriniz.");
            return;
        }

        setEnrolling(true);
        try {
            // 1. Course Enrollment (Mevcut Mantık)
            const enrollmentRef = await addDoc(collection(db, 'course_enrollments'), {
                courseId: course!.id,
                userId: user!.uid,
                userName: user!.displayName || user!.email,
                userEmail: user!.email,
                enrolledAt: new Date(),
                status: 'active',
                progress: 0
            });
            setEnrollmentId(enrollmentRef.id);

            // 2. Registrations Collection (Yeni Mantık)
            await addDoc(collection(db, 'registrations'), {
                courseId: course!.id,
                courseTitle: course!.title,
                userId: user!.uid,
                userName: user!.displayName || user!.email,
                userEmail: user!.email,
                phone: phone,
                note: note,
                date: new Date(),
                status: 'pending'
            });

            setIsEnrolled(true);
            setShowModal(false);
            alert('Kursa başarıyla kaydoldunuz! Eğitmen sizinle iletişime geçecektir.');
        } catch (error) {
            console.error('Error enrolling:', error);
            alert('Kayıt sırasında bir hata oluştu.');
        } finally {
            setEnrolling(false);
        }
    };

    const handleCancelEnroll = async () => {
        if (!enrollmentId && user && course) {
            try {
                const q = query(
                    collection(db, 'course_enrollments'),
                    where('courseId', '==', course.id),
                    where('userId', '==', user.uid)
                );
                const snap = await getDocs(q);
                if (!snap.empty) {
                    setEnrollmentId(snap.docs[0].id);
                } else {
                    return;
                }
            } catch (e) {
                console.error(e);
                return;
            }
        }

        if (confirm('Bu kurstan kaydınızı silmek istediğinize emin misiniz?')) {
            setEnrolling(true);
            try {
                const targetId = enrollmentId;
                if (!targetId) {
                    const q = query(
                        collection(db, 'course_enrollments'),
                        where('courseId', '==', course!.id),
                        where('userId', '==', user!.uid)
                    );
                    const snap = await getDocs(q);
                    if (!snap.empty) {
                        await deleteDoc(doc(db, 'course_enrollments', snap.docs[0].id));
                    }
                } else {
                    await deleteDoc(doc(db, 'course_enrollments', targetId));
                }

                setIsEnrolled(false);
                setEnrollmentId(null);
                alert('Kaydınız silindi.');
            } catch (error) {
                console.error('Error canceling enrollment:', error);
                alert('Kayıt silinirken hata oluştu.');
            } finally {
                setEnrolling(false);
            }
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
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[course.difficulty] || 'bg-gray-100'}`}>
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
                                            {(() => {
                                                try {
                                                    return new Date(course.startDate.seconds ? course.startDate.seconds * 1000 : course.startDate).toLocaleDateString('tr-TR');
                                                } catch (e) {
                                                    return '';
                                                }
                                            })()}
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
                                        <div className="mb-4 space-y-3">
                                            <div className="bg-green-500/10 text-green-500 rounded-xl p-4 text-center font-medium">
                                                <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
                                                Kursa Kayıtlısınız
                                            </div>
                                            <button
                                                onClick={handleCancelEnroll}
                                                disabled={enrolling}
                                                className="w-full bg-red-500/10 text-red-500 border border-red-500/20 font-semibold py-3 rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                <X className="w-4 h-4" />
                                                {enrolling ? 'İşlem yapılıyor...' : 'Kaydı İptal Et / Ayrıl'}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={openRegistrationModal}
                                            disabled={enrolling || (course.maxStudents ? (course.enrolledCount || 0) >= course.maxStudents : false)}
                                            className="w-full bg-primary text-black font-semibold py-4 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                                        >
                                            {enrolling ? 'İşlem yapılıyor...' :
                                                (course.maxStudents && (course.enrolledCount || 0) >= course.maxStudents) ? 'Kontenjan Dolu' :
                                                    'Kursa Kaydol'}
                                        </button>
                                    )}

                                    {/* Favorite and Share Buttons */}
                                    <div className="flex gap-2 mb-4">
                                        <FavoriteButton
                                            eventId={course.id}
                                            type='course'
                                            className="flex-1 justify-center py-3 border border-border rounded-xl hover:bg-muted/50"
                                            showText
                                        />
                                        <button
                                            onClick={handleShare}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 border border-border rounded-xl hover:bg-muted/50 text-foreground transition-colors"
                                        >
                                            <Share2 className="w-5 h-5" />
                                            Paylaş
                                        </button>
                                    </div>

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

                                    {/* WhatsApp Contact Button */}
                                    {course.whatsapp && (
                                        <a
                                            href={`https://wa.me/${course.whatsapp.replace(/\s+/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600/10 text-green-500 border border-green-600/20 hover:bg-green-600/20 rounded-xl transition-all font-semibold"
                                        >
                                            <Phone className="w-5 h-5" />
                                            WhatsApp ile İletişime Geç
                                        </a>
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

            {/* Content Tabs */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl">
                    {/* Tab Navigation */}
                    <div className="flex items-center gap-1 border-b border-border overflow-x-auto mb-8">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                            <FileText className="w-4 h-4" />
                            Genel Bakış
                        </button>
                        <button
                            onClick={() => setActiveTab('curriculum')}
                            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'curriculum' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                            <List className="w-4 h-4" />
                            Müfredat
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                            <Star className="w-4 h-4" />
                            Değerlendirmeler
                        </button>
                        <button
                            onClick={() => setActiveTab('qa')}
                            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${activeTab === 'qa' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                            <MessageCircle className="w-4 h-4" />
                            Soru-Cevap
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div>
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                {/* Description */}
                                <section className="mb-12">
                                    <h2 className="text-2xl font-bold text-foreground mb-6">Kurs Hakkında</h2>
                                    <p className="text-muted-foreground">{course.description}</p>
                                </section>

                                {/* Learning Outcomes */}
                                {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                                    <section className="mb-12">
                                        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                                            <Award className="w-6 h-6 text-primary" />
                                            Bu Kursta Neler Öğreneceksiniz?
                                        </h2>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {course.learningOutcomes.map((outcome: string, index: number) => (
                                                <div key={index} className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg">
                                                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                                    <p className="text-foreground">{outcome}</p>
                                                </div>
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
                                                {course.requirements.map((req: string, index: number) => (
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
                            </div>
                        )}

                        {activeTab === 'curriculum' && (
                            <section className="mb-12">
                                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                                    <BookOpen className="w-6 h-6 text-primary" />
                                    Müfredat
                                </h2>
                                <div className="space-y-4">
                                    {course.curriculum && course.curriculum.map((week: any, index: number) => (
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
                                                {week.topics.map((topic: string, topicIndex: number) => (
                                                    <div key={topicIndex} className="flex items-center gap-3 p-2 text-muted-foreground">
                                                        <PlayCircle className="w-4 h-4 text-primary" />
                                                        <span>{topic}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </section>
                        )}

                        {activeTab === 'reviews' && (
                            <section>
                                <ReviewSection courseId={course.id} />
                            </section>
                        )}

                        {activeTab === 'qa' && (
                            <section>
                                <QuestionSection courseId={course.id} instructorId={course.instructorId} />
                            </section>
                        )}
                    </div>
                </div>

                {/* More Courses Section */}
                {instructorCourses.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-border">
                        <h2 className="text-2xl font-bold text-foreground mb-6">Eğitmenin Diğer Kursları</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {instructorCourses.map(c => (
                                <CourseCard key={c.id} course={c} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Registration Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl w-full max-w-md relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X /></button>
                        <h3 className="text-xl font-bold text-white mb-4">Kayıt Bilgileri</h3>

                        <label className="block text-sm text-gray-400 mb-2">Telefon Numaranız <span className="text-red-500">*</span></label>
                        <input
                            type="tel"
                            required
                            placeholder="05XX..."
                            className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white mb-4 focus:border-primary focus:outline-none"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                        />

                        <label className="block text-sm text-gray-400 mb-2">Eğitmene Notunuz (Opsiyonel)</label>
                        <textarea
                            className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white mb-6 focus:border-primary focus:outline-none resize-none"
                            rows={3}
                            value={note}
                            onChange={e => setNote(e.target.value)}
                        />

                        <div className="flex gap-3">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-zinc-800 rounded-xl text-white hover:bg-zinc-700 transition-colors">İptal</button>
                            <button onClick={handleRegister} className="flex-1 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-colors">Kaydı Tamamla</button>
                        </div>
                    </div>
                </div>
            )}
            <ViewTracker collectionName="courses" docId={id} />
        </div>
    );
}
