'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { Users, Calendar, MapPin, Check, Share2, Trophy, TrendingUp, Clock, ArrowRight, X, Instagram, Mail, Globe, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Modal from '@/components/Modal';

// Category configuration (same as clubs page)
const categoryConfig: Record<string, {
    gradient: string;
    border: string;
    color: string;
    badge: string;
}> = {
    'spor': {
        gradient: 'from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-500/30',
        color: 'text-blue-500',
        badge: 'bg-blue-500/20 text-blue-400'
    },
    'sanat': {
        gradient: 'from-purple-500/20 to-pink-500/20',
        border: 'border-purple-500/30',
        color: 'text-purple-500',
        badge: 'bg-purple-500/20 text-purple-400'
    },
    'teknoloji': {
        gradient: 'from-green-500/20 to-emerald-500/20',
        border: 'border-green-500/30',
        color: 'text-green-500',
        badge: 'bg-green-500/20 text-green-400'
    },
    'sosyal': {
        gradient: 'from-pink-500/20 to-rose-500/20',
        border: 'border-pink-500/30',
        color: 'text-pink-500',
        badge: 'bg-pink-500/20 text-pink-400'
    },
    'akademik': {
        gradient: 'from-orange-500/20 to-yellow-500/20',
        border: 'border-orange-500/30',
        color: 'text-orange-500',
        badge: 'bg-orange-500/20 text-orange-400'
    },
    'müzik': {
        gradient: 'from-indigo-500/20 to-violet-500/20',
        border: 'border-indigo-500/30',
        color: 'text-indigo-500',
        badge: 'bg-indigo-500/20 text-indigo-400'
    }
};

const getDefaultConfig = () => ({
    gradient: 'from-primary/20 to-primary/10',
    border: 'border-primary/30',
    color: 'text-primary',
    badge: 'bg-primary/20 text-primary'
});

export default function ClubDetailPage() {
    const { id } = useParams();
    const [clubInfo, setClubInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isJoined, setIsJoined] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [clubEvents, setClubEvents] = useState<any[]>([]);
    const [joinReason, setJoinReason] = useState('');
    const [joinSuccess, setJoinSuccess] = useState(false);

    // Fetch club data
    useEffect(() => {
        const fetchClub = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, 'clubs', id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setClubInfo({ id: docSnap.id, ...docSnap.data() });

                    // Fetch club events
                    const eventsQuery = query(
                        collection(db, 'events'),
                        where('clubId', '==', id)
                    );
                    const eventsSnap = await getDocs(eventsQuery);
                    const events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setClubEvents(events);
                }
            } catch (error) {
                console.error("Error fetching club:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClub();
    }, [id]);

    const handleJoinSubmit = () => {
        // Simulate join action
        setIsJoined(true);
        setJoinSuccess(true);
        setTimeout(() => {
            setIsJoinModalOpen(false);
            setJoinSuccess(false);
            setJoinReason('');
        }, 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black">
                <Navbar />
                {/* Hero Skeleton */}
                <div className="relative h-[400px] bg-white/5 animate-pulse">
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                        <div className="container mx-auto flex items-end gap-6">
                            <div className="w-32 h-32 rounded-full bg-white/10" />
                            <div className="flex-1 space-y-3">
                                <div className="h-10 bg-white/10 rounded w-1/3" />
                                <div className="h-6 bg-white/10 rounded w-1/2" />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Content Skeleton */}
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-4 gap-4 mb-12">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="glass-strong p-6 rounded-xl animate-pulse h-24" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!clubInfo) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Navbar />
                <div className="text-center">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Kulüp Bulunamadı</h2>
                    <p className="text-gray-400">Bu kulüp mevcut değil veya kaldırılmış.</p>
                </div>
            </div>
        );
    }

    const category = clubInfo.category?.toLowerCase() || 'default';
    const config = categoryConfig[category] || getDefaultConfig();
    const foundedYear = clubInfo.createdAt ? new Date(clubInfo.createdAt.seconds * 1000).getFullYear() : 2024;
    const upcomingEvents = clubEvents.filter(e => new Date(e.date) > new Date());

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <div className="relative h-[400px] overflow-hidden">
                {/* Cover Image */}
                <div className="absolute inset-0">
                    {clubInfo.coverImage || clubInfo.imageUrl ? (
                        <Image
                            src={clubInfo.coverImage || clubInfo.imageUrl}
                            alt={clubInfo.name}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${config.gradient}`} />
                    )}
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="container mx-auto">
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                            {/* Logo */}
                            <div className="relative w-32 h-32 rounded-full border-4 border-black overflow-hidden bg-white/10 flex-shrink-0 shadow-2xl">
                                {clubInfo.logo ? (
                                    <Image
                                        src={clubInfo.logo}
                                        alt={clubInfo.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Users className={`w-16 h-16 ${config.color}`} />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl md:text-4xl font-bold">{clubInfo.name}</h1>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.badge} capitalize`}>
                                        {clubInfo.category || 'Genel'}
                                    </span>
                                </div>
                                <p className="text-gray-300 text-lg mb-2">{clubInfo.slogan || 'Kampüsün en aktif topluluğu'}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {clubInfo.memberCount || 0} üye
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {foundedYear}'den beri
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => isJoined ? setIsJoined(false) : setIsJoinModalOpen(true)}
                                    className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold transition-all shadow-glow flex items-center justify-center gap-2 ${isJoined
                                            ? 'bg-white/10 text-white border-2 border-primary hover:bg-white/20'
                                            : 'bg-primary hover:bg-primary-hover text-black'
                                        }`}
                                >
                                    {isJoined ? (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Üyesin
                                        </>
                                    ) : (
                                        'Katıl'
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsShareModalOpen(true)}
                                    className="px-4 py-3 glass-strong border border-white/20 rounded-xl hover:bg-white/10 transition-all"
                                    aria-label="Paylaş"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="glass-strong p-6 rounded-xl text-center border border-white/10 hover:border-primary/30 transition-colors">
                        <Users className={`w-8 h-8 ${config.color} mx-auto mb-2`} />
                        <div className="text-3xl font-bold text-white mb-1">{clubInfo.memberCount || 0}</div>
                        <div className="text-sm text-gray-400">Toplam Üye</div>
                    </div>
                    <div className="glass-strong p-6 rounded-xl text-center border border-white/10 hover:border-primary/30 transition-colors">
                        <Calendar className={`w-8 h-8 ${config.color} mx-auto mb-2`} />
                        <div className="text-3xl font-bold text-white mb-1">{foundedYear}</div>
                        <div className="text-sm text-gray-400">Kuruluş Yılı</div>
                    </div>
                    <div className="glass-strong p-6 rounded-xl text-center border border-white/10 hover:border-primary/30 transition-colors">
                        <Trophy className={`w-8 h-8 ${config.color} mx-auto mb-2`} />
                        <div className="text-3xl font-bold text-white mb-1">{clubEvents.length}</div>
                        <div className="text-sm text-gray-400">Etkinlik</div>
                    </div>
                    <div className="glass-strong p-6 rounded-xl text-center border border-white/10 hover:border-primary/30 transition-colors">
                        <TrendingUp className={`w-8 h-8 ${config.color} mx-auto mb-2`} />
                        <div className="text-3xl font-bold text-white mb-1">{upcomingEvents.length}</div>
                        <div className="text-sm text-gray-400">Yaklaşan</div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About Section */}
                        <div className="glass-strong border border-white/10 p-8 rounded-2xl">
                            <h2 className={`text-2xl font-bold mb-4 flex items-center gap-3`}>
                                <span className={`w-1 h-8 ${config.gradient} rounded-full`} />
                                Hakkımızda
                            </h2>
                            <p className="text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap">
                                {clubInfo.description || 'Bu kulüp hakkında henüz detaylı açıklama eklenmemiş.'}
                            </p>

                            {clubInfo.mission && (
                                <div className="mt-6 p-4 glass rounded-lg border border-white/5">
                                    <h3 className="font-bold text-white mb-2">Misyonumuz</h3>
                                    <p className="text-gray-300 text-sm">{clubInfo.mission}</p>
                                </div>
                            )}
                        </div>

                        {/* Events Section */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <Calendar className={`w-6 h-6 ${config.color}`} />
                                Yaklaşan Etkinlikler
                            </h2>
                            {upcomingEvents.length === 0 ? (
                                <div className="glass-strong border border-white/10 p-12 rounded-2xl text-center">
                                    <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">Yaklaşan Etkinlik Yok</h3>
                                    <p className="text-gray-400 text-sm">Bu kulübün yakında planlanmış etkinliği bulunmuyor.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {upcomingEvents.slice(0, 4).map((event) => (
                                        <div
                                            key={event.id}
                                            className="glass-strong p-4 rounded-xl border border-white/10 hover:border-primary/30 transition-all hover:scale-105 group cursor-pointer"
                                        >
                                            {event.imageUrl && (
                                                <div className="aspect-video relative rounded-lg overflow-hidden mb-3">
                                                    <Image
                                                        src={event.imageUrl}
                                                        alt={event.title}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                        unoptimized
                                                    />
                                                </div>
                                            )}
                                            <div className={`text-xs ${config.color} font-semibold mb-2 flex items-center gap-2`}>
                                                <Clock className="w-3 h-3" />
                                                {new Date(event.date).toLocaleDateString('tr-TR')}
                                            </div>
                                            <h4 className="font-bold text-white mb-2 line-clamp-2">{event.title}</h4>
                                            <div className="flex items-center justify-between text-sm mt-3">
                                                <span className="text-gray-400 flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    {event.participantIds?.length || 0} katılımcı
                                                </span>
                                                <span className={`flex items-center gap-1 ${config.color} font-semibold group-hover:gap-2 transition-all`}>
                                                    Detay
                                                    <ArrowRight className="w-4 h-4" />
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Contact Info */}
                            {(clubInfo.email || clubInfo.instagram || clubInfo.website) && (
                                <div className="glass-strong border border-white/10 p-6 rounded-2xl">
                                    <h3 className="font-bold text-white mb-4">İletişim</h3>
                                    <div className="space-y-3">
                                        {clubInfo.email && (
                                            <a
                                                href={`mailto:${clubInfo.email}`}
                                                className="flex items-center gap-3 text-gray-300 hover:text-primary transition-colors group"
                                            >
                                                <Mail className="w-5 h-5 flex-shrink-0" />
                                                <span className="text-sm truncate">{clubInfo.email}</span>
                                            </a>
                                        )}
                                        {clubInfo.instagram && (
                                            <a
                                                href={`https://instagram.com/${clubInfo.instagram}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-gray-300 hover:text-primary transition-colors group"
                                            >
                                                <Instagram className="w-5 h-5 flex-shrink-0" />
                                                <span className="text-sm">@{clubInfo.instagram}</span>
                                            </a>
                                        )}
                                        {clubInfo.website && (
                                            <a
                                                href={clubInfo.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-gray-300 hover:text-primary transition-colors group"
                                            >
                                                <Globe className="w-5 h-5 flex-shrink-0" />
                                                <span className="text-sm truncate">{clubInfo.website}</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Location */}
                            {clubInfo.location && (
                                <div className="glass-strong border border-white/10 p-6 rounded-2xl">
                                    <h3 className="font-bold text-white mb-4">Lokasyon</h3>
                                    <div className="flex items-start gap-3 text-gray-300">
                                        <MapPin className={`w-5 h-5 flex-shrink-0 ${config.color}`} />
                                        <span className="text-sm">{clubInfo.location}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Join Modal */}
            <Modal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
                title="Kulübe Katıl"
                size="md"
            >
                {joinSuccess ? (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Başvurun Alındı!</h3>
                        <p className="text-gray-400">Kulüp yöneticileri en kısa sürede değerlendirecek.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <p className="text-gray-300">
                            <strong className="text-white">{clubInfo.name}</strong> kulübüne katılmak için başvurunuzu gönderin.
                        </p>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Neden katılmak istiyorsunuz? <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={joinReason}
                                onChange={(e) => setJoinReason(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none resize-none"
                                rows={4}
                                placeholder="Bu kulübe katılma sebebinizi kısaca açıklayın..."
                                required
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsJoinModalOpen(false)}
                                className="flex-1 px-4 py-3 glass-strong border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleJoinSubmit}
                                disabled={!joinReason.trim()}
                                className="flex-1 px-4 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-glow"
                            >
                                Başvuru Gönder
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Share Modal */}
            <Modal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                title="Kulübü Paylaş"
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-gray-300 text-sm">Bu kulübü arkadaşlarınla paylaş!</p>
                    <div className="flex gap-2">
                        <button className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-all border border-white/10">
                            WhatsApp
                        </button>
                        <button className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-all border border-white/10">
                            Instagram
                        </button>
                        <button className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-lg transition-all border border-white/10">
                            Link Kopyala
                        </button>
                    </div>
                </div>
            </Modal>

            <Footer />
        </div>
    );
}
