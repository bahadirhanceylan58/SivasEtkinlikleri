'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Ticket, FileText, MapPin, LogOut, Settings, Heart, Users, Calendar, Trophy, Activity, Edit2, Mail, Phone, Instagram, Globe, Bell, Lock, Trash2, Download, Share2, X, Camera, Check, PlusCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Modal from '@/components/Modal';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';
import FavoriteButton from '@/components/FavoriteButton';
import CourseCard from '@/components/CourseCard';
import { MessageCircle, Star, BookOpen, HelpCircle } from 'lucide-react';

type TabType = 'overview' | 'tickets' | 'favorites' | 'clubs' | 'courses' | 'questions' | 'reviews' | 'applications' | 'settings';

export default function ProfilePage() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [tickets, setTickets] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [joinedClubs, setJoinedClubs] = useState<any[]>([]);
    const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
    const [myQuestions, setMyQuestions] = useState<any[]>([]);
    const [myReviews, setMyReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Edit profile state
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [phone, setPhone] = useState('');
    const [instagram, setInstagram] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchUserData();
        }
    }, [user, authLoading, router]);

    const fetchUserData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch user profile
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setDisplayName(userData.displayName || user.displayName || '');
                setBio(userData.bio || '');
                setPhone(userData.phone || '');
                setInstagram(userData.instagram || '');

                // Fetch tickets
                if (userData.tickets) {
                    setTickets(userData.tickets.reverse());
                }

                // Fetch favorites
                if (userData.favorites) {
                    const favoritesData = await Promise.all(
                        userData.favorites.map(async (eventId: string) => {
                            const eventDoc = await getDoc(doc(db, 'events', eventId));
                            return eventDoc.exists() ? { id: eventDoc.id, ...eventDoc.data() } : null;
                        })
                    );
                    setFavorites(favoritesData.filter(f => f !== null));
                }

                // Fetch joined clubs
                if (userData.joinedClubs) {
                    const clubsData = await Promise.all(
                        userData.joinedClubs.map(async (clubId: string) => {
                            const clubDoc = await getDoc(doc(db, 'clubs', clubId));
                            return clubDoc.exists() ? { id: clubDoc.id, ...clubDoc.data() } : null;
                        })
                    );
                    setJoinedClubs(clubsData.filter(c => c !== null));
                }
            }

            // Fetch Applications
            const qApps = query(collection(db, 'club_applications'), where("userId", "==", user.uid));
            const appsSnapshot = await getDocs(qApps);
            const apps = appsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setApplications(apps);

            // Fetch Enrolled Courses
            const qEnrollments = query(collection(db, 'course_enrollments'), where("userId", "==", user.uid));
            const enrollmentsSnapshot = await getDocs(qEnrollments);
            const courseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);

            if (courseIds.length > 0) {
                const coursesData = await Promise.all(courseIds.map(async (cId) => {
                    const cDoc = await getDoc(doc(db, 'courses', cId));
                    return cDoc.exists() ? { id: cDoc.id, ...cDoc.data() } : null;
                }));
                setEnrolledCourses(coursesData.filter(c => c !== null));
            }

            // Fetch My Questions
            const qQuestions = query(collection(db, 'questions'), where("userId", "==", user.uid));
            const questionsSnapshot = await getDocs(qQuestions);
            // We need course titles for questions
            const questionsData = await Promise.all(questionsSnapshot.docs.map(async (d) => {
                const qData = d.data();
                let courseTitle = 'Bilinmeyen Kurs';
                if (qData.courseId) {
                    const cDoc = await getDoc(doc(db, 'courses', qData.courseId));
                    if (cDoc.exists()) courseTitle = cDoc.data().title;
                }
                return { id: d.id, ...qData, courseTitle };
            }));
            setMyQuestions(questionsData);

            // Fetch My Reviews
            const qReviews = query(collection(db, 'reviews'), where("userId", "==", user.uid));
            const reviewsSnapshot = await getDocs(qReviews);
            // We need course titles for reviews
            const reviewsData = await Promise.all(reviewsSnapshot.docs.map(async (d) => {
                const rData = d.data();
                let courseTitle = 'Bilinmeyen Kurs';
                if (rData.courseId) {
                    const cDoc = await getDoc(doc(db, 'courses', rData.courseId));
                    if (cDoc.exists()) courseTitle = cDoc.data().title;
                }
                return { id: d.id, ...rData, courseTitle };
            }));
            setMyReviews(reviewsData);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                displayName,
                bio,
                phone,
                instagram
            });
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    if (authLoading || (loading && user)) {
        return (
            <div className="min-h-screen bg-black">
                <Navbar />
                <div className="container mx-auto px-4 py-12">
                    {/* Header Skeleton */}
                    <div className="relative mb-8">
                        <div className="h-48 bg-white/5 rounded-t-2xl animate-pulse" />
                        <div className="container mx-auto px-4">
                            <div className="relative -mt-16 flex items-end gap-6">
                                <div className="w-32 h-32 rounded-full bg-white/10 animate-pulse" />
                                <div className="flex-1 pb-4 space-y-3">
                                    <div className="h-8 bg-white/10 rounded w-1/4 animate-pulse" />
                                    <div className="h-4 bg-white/10 rounded w-1/3 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const memberSince = user?.metadata?.creationTime
        ? new Date(user.metadata.creationTime).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })
        : 'Bilinmiyor';

    const stats = [
        { icon: Ticket, label: 'Biletler', value: tickets.length, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { icon: Users, label: 'Kulüpler', value: joinedClubs.length, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { icon: BookOpen, label: 'Kurslar', value: enrolledCourses.length, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { icon: Heart, label: 'Favoriler', value: favorites.length, color: 'text-pink-500', bg: 'bg-pink-500/10' }
    ];

    const tabs = [
        { id: 'overview' as TabType, label: 'Genel Bakış', icon: Activity },
        { id: 'tickets' as TabType, label: 'Biletlerim', icon: Ticket },
        { id: 'courses' as TabType, label: 'Kurslarım', icon: BookOpen },
        { id: 'favorites' as TabType, label: 'Favorilerim', icon: Heart },
        { id: 'clubs' as TabType, label: 'Kulüplerim', icon: Users },
        { id: 'questions' as TabType, label: 'Sorularım', icon: HelpCircle },
        { id: 'reviews' as TabType, label: 'Değerlendirmelerim', icon: Star },
        { id: 'applications' as TabType, label: 'Başvurularım', icon: FileText },
        { id: 'settings' as TabType, label: 'Ayarlar', icon: Settings }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
            <Navbar />
            <div className="flex-1">
                {/* Profile Header with Cover */}
                <div className="relative">
                    {/* Cover Photo */}
                    <div className="h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
                        <button className="absolute top-4 right-4 p-2 glass-strong rounded-lg hover:bg-white/20 transition-colors">
                            <Camera className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Profile Info */}
                    <div className="container mx-auto px-4">
                        <div className="relative -mt-16 flex flex-col md:flex-row items-start md:items-end gap-6">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-background bg-primary flex items-center justify-center text-black font-bold text-4xl shadow-2xl transition-colors duration-300">
                                    {displayName ? displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                                </div>
                                <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full hover:bg-primary-hover transition-colors shadow-lg">
                                    <Camera className="w-4 h-4 text-black" />
                                </button>
                            </div>

                            {/* Info */}
                            <div className="flex-1 pb-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-foreground">{displayName || user?.email?.split('@')[0]}</h1>
                                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold border border-primary/30">
                                        Standart Üye
                                    </span>
                                </div>
                                {bio && <p className="text-muted-foreground mb-2">{bio}</p>}
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Mail className="w-4 h-4" />
                                        {user?.email}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {memberSince} tarihinden beri üye
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pb-4">
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="px-4 py-2 glass-strong border border-border text-foreground font-semibold rounded-xl hover:bg-muted/10 transition-all flex items-center gap-2"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Profili Düzenle
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 glass-strong border border-red-500/20 text-red-400 font-semibold rounded-xl hover:bg-red-500/10 transition-all flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Çıkış
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Dashboard */}
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="glass-strong p-6 rounded-xl border border-border hover:border-primary/30 transition-all group"
                            >
                                <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="flex overflow-x-auto border-b border-border mb-8 gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-4 font-semibold transition-all relative whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="max-w-6xl">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                {/* Hızlı İşlemler */}
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground mb-4">Hızlı İşlemler</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div
                                            onClick={() => router.push('/etkinlik-olustur')}
                                            className="cursor-pointer group relative overflow-hidden rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-6 hover:bg-yellow-500/20 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500 text-black">
                                                    <PlusCircle className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground group-hover:text-yellow-500 transition-colors">Etkinlik Oluştur</h3>
                                                    <p className="text-sm text-muted-foreground">Toplulukla paylaşmak için etkinlik ekle</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => router.push('/kulup-olustur')}
                                            className="cursor-pointer group relative overflow-hidden rounded-xl border border-purple-500/20 bg-purple-500/10 p-6 hover:bg-purple-500/20 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white">
                                                    <Users className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground group-hover:text-purple-400 transition-colors">Kulüp Kur</h3>
                                                    <p className="text-sm text-muted-foreground">kendi topluluğunu oluştur ve yönet</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-foreground mb-4">Son Aktiviteler</h2>
                                    {tickets.length === 0 && joinedClubs.length === 0 ? (
                                        <div className="text-center py-12 glass-strong rounded-2xl border border-border">
                                            <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-foreground mb-2">Henüz Aktivite Yok</h3>
                                            <p className="text-muted-foreground mb-6">Etkinliklere katılın ve kulüplere üye olun!</p>
                                            <button
                                                onClick={() => router.push('/')}
                                                className="px-6 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all"
                                            >
                                                Etkinlikleri Keşfet
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {tickets.slice(0, 3).map((ticket, index) => (
                                                <div key={index} className="flex gap-4 p-4 glass-strong rounded-xl border border-border hover:border-primary/30 transition-all">
                                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                        <Ticket className="w-5 h-5 text-blue-500" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-foreground font-medium">{ticket.eventTitle} etkinliği için bilet aldınız</p>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(ticket.purchaseDate || Date.now()).toLocaleDateString('tr-TR')}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tickets Tab */}
                        {activeTab === 'tickets' && (
                            <div className="space-y-4">
                                {tickets.length === 0 ? (
                                    <div className="text-center py-12 glass-strong rounded-2xl border border-border">
                                        <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-foreground mb-2">Henüz Biletiniz Yok</h3>
                                        <p className="text-muted-foreground">İlk biletinizi almak için etkinliklere göz atın!</p>
                                    </div>
                                ) : (
                                    tickets.map((ticket, index) => (
                                        <div key={index} className="glass-strong border border-border rounded-xl p-4 md:p-6 hover:border-primary/30 transition-all">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="glass rounded-lg w-full md:w-32 flex flex-col items-center justify-center p-4 border border-border">
                                                    <span className="text-3xl font-bold text-primary">{new Date(ticket.eventDate).getDate()}</span>
                                                    <span className="text-sm uppercase text-muted-foreground">{new Date(ticket.eventDate).toLocaleDateString('tr-TR', { month: 'short' })}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-xl mb-3 text-foreground">{ticket.eventTitle}</h3>
                                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4 text-primary" />
                                                            {ticket.eventLocation}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Ticket className="w-4 h-4 text-primary" />
                                                            {ticket.ticketCount} Adet
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4 text-primary" />
                                                            {new Date(ticket.eventDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button className="flex items-center gap-2 px-4 py-2 glass border border-border rounded-lg hover:bg-muted/10 transition-all text-sm">
                                                            <Download className="w-4 h-4" />
                                                            İndir
                                                        </button>
                                                        <button className="flex items-center gap-2 px-4 py-2 glass border border-border rounded-lg hover:bg-muted/10 transition-all text-sm">
                                                            <Share2 className="w-4 h-4" />
                                                            Paylaş
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-center bg-white p-3 rounded-lg">
                                                    <QRCodeSVG value={ticket.qrCode} size={80} />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* My Courses Tab */}
                        {activeTab === 'courses' && (
                            <div>
                                {enrolledCourses.length === 0 ? (
                                    <div className="text-center py-12 glass-strong rounded-2xl border border-border">
                                        <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-foreground mb-2">Henüz Bir Kursa Kayıtlı Değilsiniz</h3>
                                        <p className="text-muted-foreground mb-6">Kendinizi geliştirmek için kurslara göz atın!</p>
                                        <button
                                            onClick={() => router.push('/kurslar')}
                                            className="px-6 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all"
                                        >
                                            Kursları Keşfet
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {enrolledCourses.map((course: any) => (
                                            <CourseCard key={course.id} course={course} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* My Questions Tab */}
                        {activeTab === 'questions' && (
                            <div className="space-y-4">
                                {myQuestions.length === 0 ? (
                                    <div className="text-center py-12 glass-strong rounded-2xl border border-border">
                                        <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-foreground mb-2">Henüz Soru Sormadınız</h3>
                                        <p className="text-muted-foreground">Kafanıza takılanları eğitmenlere sorabilirsiniz.</p>
                                    </div>
                                ) : (
                                    myQuestions.map((q: any) => (
                                        <div key={q.id} className="glass-strong p-6 rounded-xl border border-border hover:border-primary/30 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-foreground text-lg mb-1">{q.courseTitle}</h4>
                                                    <p className="text-sm text-muted-foreground">{new Date(q.createdAt?.seconds * 1000).toLocaleDateString('tr-TR')}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${q.isAnswered ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                    {q.isAnswered ? 'Yanıtlandı' : 'Bekliyor'}
                                                </span>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-lg mb-4">
                                                <p className="text-foreground">{q.text}</p>
                                            </div>
                                            {q.answer && (
                                                <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <MessageCircle className="w-4 h-4 text-primary" />
                                                        <span className="font-bold text-primary">Eğitmen Yanıtı</span>
                                                    </div>
                                                    <p className="text-foreground/90 text-sm">{q.answer}</p>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => router.push(`/kurslar/${q.courseId}?tab=qa`)}
                                                className="mt-4 text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1"
                                            >
                                                Kursa Git <BookOpen className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* My Reviews Tab */}
                        {activeTab === 'reviews' && (
                            <div className="space-y-4">
                                {myReviews.length === 0 ? (
                                    <div className="text-center py-12 glass-strong rounded-2xl border border-border">
                                        <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-foreground mb-2">Henüz Değerlendirme Yapmadınız</h3>
                                        <p className="text-muted-foreground">Katıldığınız kursları değerlendirerek diğer öğrencilere yardımcı olun.</p>
                                    </div>
                                ) : (
                                    myReviews.map((r: any) => (
                                        <div key={r.id} className="glass-strong p-6 rounded-xl border border-border hover:border-primary/30 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-foreground text-lg mb-1">{r.courseTitle}</h4>
                                                    <div className="flex items-center gap-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(r.createdAt?.seconds * 1000).toLocaleDateString('tr-TR')}
                                                </span>
                                            </div>
                                            <p className="text-foreground/90 italic">"{r.comment}"</p>
                                            <button
                                                onClick={() => router.push(`/kurslar/${r.courseId}?tab=reviews`)}
                                                className="mt-4 text-sm text-primary hover:text-primary-hover font-medium flex items-center gap-1"
                                            >
                                                Kursa Git <BookOpen className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Favorites Tab */}
                        {activeTab === 'favorites' && (
                            <div>
                                {favorites.length === 0 ? (
                                    <div className="text-center py-12 glass-strong rounded-2xl border border-border">
                                        <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-foreground mb-2">Henüz Favori Yok</h3>
                                        <p className="text-muted-foreground">Beğendiğiniz etkinlikleri favorilere ekleyin!</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {favorites.map((event: any) => (
                                            <div key={event.id} className="glass-strong rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all group">
                                                {event.imageUrl && (
                                                    <div className="relative h-48">
                                                        <Image
                                                            src={event.imageUrl}
                                                            alt={event.title}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                            unoptimized
                                                        />
                                                    </div>

                                                )}
                                                <div className="absolute top-2 right-2 z-10">
                                                    <FavoriteButton eventId={event.id} />
                                                </div>
                                                <div className="p-4">
                                                    <h4 className="font-bold text-foreground mb-2 line-clamp-2">{event.title}</h4>
                                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-1 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {event.location}
                                                    </p>
                                                    <button className="w-full px-4 py-2 bg-primary hover:bg-primary-hover text-black font-semibold rounded-lg transition-all">
                                                        Detayları Gör
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Clubs Tab */}
                        {activeTab === 'clubs' && (
                            <div>
                                {joinedClubs.length === 0 ? (
                                    <div className="text-center py-12 glass-strong rounded-2xl border border-border">
                                        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-foreground mb-2">Henüz Kulüp Üyeliğiniz Yok</h3>
                                        <p className="text-muted-foreground mb-6">İlgi alanlarınıza uygun kulüplere katılın!</p>
                                        <button
                                            onClick={() => router.push('/kulupler')}
                                            className="px-6 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all"
                                        >
                                            Kulüpleri Keşfet
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {joinedClubs.map((club: any) => (
                                            <div key={club.id} className="glass-strong p-6 rounded-xl border border-border hover:border-primary/30 transition-all">
                                                <div className="flex items-start gap-4 mb-4">
                                                    <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                                                        <Users className="w-8 h-8 text-primary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-foreground mb-1">{club.name}</h4>
                                                        <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
                                                            {club.category}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{club.description}</p>
                                                <button className="w-full px-4 py-2 glass border border-border rounded-lg hover:bg-muted/10 transition-all text-sm font-semibold">
                                                    Detayları Gör
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Applications Tab */}
                        {activeTab === 'applications' && (
                            <div className="space-y-4">
                                {applications.length === 0 ? (
                                    <div className="text-center py-12 glass-strong rounded-2xl border border-border">
                                        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-foreground mb-2">Henüz Başvurunuz Yok</h3>
                                        <p className="text-muted-foreground mb-6">Topluluk oluşturmak için başvuruda bulunun!</p>
                                        <button
                                            onClick={() => router.push('/kulup-basvuru')}
                                            className="px-6 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all"
                                        >
                                            Başvuru Yap
                                        </button>
                                    </div>
                                ) : (
                                    applications.map((app) => (
                                        <div key={app.id} className="glass-strong border border-border rounded-xl p-6 hover:border-primary/30 transition-all">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-xl text-foreground mb-2">{app.name}</h3>
                                                    <p className="text-sm text-muted-foreground mb-3 capitalize">{app.category}</p>
                                                    <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold border ${app.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                        app.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                            'bg-red-500/10 text-red-500 border-red-500/20'
                                                        }`}>
                                                        {app.status === 'pending' ? 'Değerlendirmede' :
                                                            app.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                                                    </span>
                                                </div>
                                                <div className="text-right text-xs text-muted-foreground">
                                                    {app.createdAt ? new Date(app.createdAt.seconds * 1000).toLocaleDateString('tr-TR') : '-'}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Settings Tab */}
                        {activeTab === 'settings' && (
                            <div className="space-y-8 max-w-2xl">
                                {/* Personal Info */}
                                <div className="glass-strong p-6 rounded-xl border border-border">
                                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-primary" />
                                        Kişisel Bilgiler
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-2">E-posta</label>
                                            <div className="px-4 py-3 glass rounded-lg border border-border text-muted-foreground">
                                                {user?.email}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-muted-foreground mb-2">Üyelik Tarihi</label>
                                            <div className="px-4 py-3 glass rounded-lg border border-border text-muted-foreground">
                                                {memberSince}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Notifications */}
                                <div className="glass-strong p-6 rounded-xl border border-border">
                                    <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-primary" />
                                        Bildirim Tercihleri
                                    </h3>
                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between p-3 glass rounded-lg border border-border cursor-pointer hover:bg-muted/10 transition-all">
                                            <span className="text-foreground">E-posta bildirimleri</span>
                                            <input type="checkbox" className="w-5 h-5" defaultChecked />
                                        </label>
                                        <label className="flex items-center justify-between p-3 glass rounded-lg border border-border cursor-pointer hover:bg-muted/10 transition-all">
                                            <span className="text-foreground">Yeni etkinlik bildirimleri</span>
                                            <input type="checkbox" className="w-5 h-5" defaultChecked />
                                        </label>
                                        <label className="flex items-center justify-between p-3 glass rounded-lg border border-border cursor-pointer hover:bg-muted/10 transition-all">
                                            <span className="text-foreground">Kulüp haberleri</span>
                                            <input type="checkbox" className="w-5 h-5" />
                                        </label>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="glass-strong p-6 rounded-xl border border-red-500/20">
                                    <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                                        <Trash2 className="w-5 h-5" />
                                        Tehlikeli Bölge
                                    </h3>
                                    <button className="w-full px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-semibold rounded-lg hover:bg-red-500/20 transition-all">
                                        Hesabı Sil
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Profili Düzenle"
                size="lg"
            >
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Görünen Ad
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none"
                            placeholder="Adınız Soyadınız"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Biyografi
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none resize-none"
                            rows={4}
                            placeholder="Kendiniz hakkında birkaç kelime..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Telefon
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none"
                            placeholder="+90 5XX XXX XX XX"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Instagram
                        </label>
                        <input
                            type="text"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none"
                            placeholder="kullaniciadi"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="flex-1 px-4 py-3 glass-strong border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="flex-1 px-4 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    Kaydet
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            <Footer />
        </div>
    );
}
