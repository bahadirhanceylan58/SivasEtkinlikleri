'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { Users, Calendar, MapPin, Check, Share2, Trophy, TrendingUp, Clock, ArrowRight, X, Instagram, Mail, Globe, CheckCircle, Edit, Camera, Save, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Modal from '@/components/Modal';

// Category configuration
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
        badge: 'bg-blue-500/10 text-blue-500'
    },
    'sanat': {
        gradient: 'from-purple-500/20 to-pink-500/20',
        border: 'border-purple-500/30',
        color: 'text-purple-500',
        badge: 'bg-purple-500/10 text-purple-500'
    },
    'teknoloji': {
        gradient: 'from-green-500/20 to-emerald-500/20',
        border: 'border-green-500/30',
        color: 'text-green-500',
        badge: 'bg-green-500/10 text-green-500'
    },
    'sosyal': {
        gradient: 'from-pink-500/20 to-rose-500/20',
        border: 'border-pink-500/30',
        color: 'text-pink-500',
        badge: 'bg-pink-500/10 text-pink-500'
    },
    'akademik': {
        gradient: 'from-orange-500/20 to-yellow-500/20',
        border: 'border-orange-500/30',
        color: 'text-orange-500',
        badge: 'bg-orange-500/10 text-orange-500'
    },
    'müzik': {
        gradient: 'from-indigo-500/20 to-violet-500/20',
        border: 'border-indigo-500/30',
        color: 'text-indigo-500',
        badge: 'bg-indigo-500/10 text-indigo-500'
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
    const { user, isAdmin } = useAuth();
    const [clubInfo, setClubInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isJoined, setIsJoined] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [clubEvents, setClubEvents] = useState<any[]>([]);
    const [joinReason, setJoinReason] = useState('');
    const [joinSuccess, setJoinSuccess] = useState(false);

    // Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        slogan: '',
        description: '',
        mission: '',
        email: '',
        instagram: '',
        website: '',
        location: '',
        category: 'spor'
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [previewLogo, setPreviewLogo] = useState('');
    const [previewCover, setPreviewCover] = useState('');

    // Fetch club data
    const fetchClub = async () => {
        if (!id) return;
        try {
            const docRef = doc(db, 'clubs', id as string);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setClubInfo({ id: docSnap.id, ...data });
                setEditForm({
                    name: data.name || '',
                    slogan: data.slogan || '',
                    description: data.description || '',
                    mission: data.mission || '',
                    email: data.email || '',
                    instagram: data.instagram || '',
                    website: data.website || '',
                    location: data.location || '',
                    category: data.category || 'spor'
                });
                setPreviewLogo(data.logo || '');
                setPreviewCover(data.coverImage || data.imageUrl || '');

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

    useEffect(() => {
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (type === 'logo') {
                setLogoFile(file);
                setPreviewLogo(URL.createObjectURL(file));
            } else {
                setCoverFile(file);
                setPreviewCover(URL.createObjectURL(file));
            }
        }
    };

    const handleUpdateClub = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clubInfo) return;
        setIsSaving(true);

        try {
            let logoUrl = clubInfo.logo;
            let coverUrl = clubInfo.coverImage;

            // Upload Logo
            if (logoFile) {
                const logoRef = ref(storage, `clubs/${id}/logo_${Date.now()}`);
                const snapshot = await uploadBytes(logoRef, logoFile);
                logoUrl = await getDownloadURL(snapshot.ref);
            }

            // Upload Cover
            if (coverFile) {
                const coverRef = ref(storage, `clubs/${id}/cover_${Date.now()}`);
                const snapshot = await uploadBytes(coverRef, coverFile);
                coverUrl = await getDownloadURL(snapshot.ref);
            }

            // Update Firestore
            await updateDoc(doc(db, 'clubs', id as string), {
                ...editForm,
                logo: logoUrl,
                coverImage: coverUrl,
                imageUrl: coverUrl, // fallback
                updatedAt: new Date()
            });

            await fetchClub(); // Refresh data
            setIsEditModalOpen(false);
            alert('Kulüp bilgileri güncellendi!');
        } catch (error) {
            console.error("Update error:", error);
            alert('Güncelleme sırasında bir hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    };

    const isOwner = user && (user.uid === clubInfo?.adminId || isAdmin);
    const category = clubInfo?.category?.toLowerCase() || 'default';
    const config = categoryConfig[category] || getDefaultConfig();
    const foundedYear = clubInfo?.createdAt ? new Date(clubInfo.createdAt.seconds * 1000).getFullYear() : 2024;
    const upcomingEvents = clubEvents.filter(e => new Date(e.date) > new Date());

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Yükleniyor...</div>;

    if (!clubInfo) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">Kulüp Bulunamadı</h2>
                    <p className="text-muted-foreground">Bu kulüp mevcut değil veya kaldırılmış.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
            <Navbar />

            {/* Hero Section */}
            <div className="relative h-[400px] overflow-hidden group">
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
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                    <div className="container mx-auto">
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                            {/* Logo */}
                            <div className="relative w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-muted flex-shrink-0 shadow-2xl group-hover:scale-105 transition-transform duration-300">
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
                                    <h1 className="text-3xl md:text-4xl font-bold text-foreground drop-shadow-sm">{clubInfo.name}</h1>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.badge} capitalize`}>
                                        {clubInfo.category || 'Genel'}
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-lg mb-2">{clubInfo.slogan || 'Kampüsün en aktif topluluğu'}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                                {isOwner ? (
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="flex-1 md:flex-none px-6 py-3 bg-primary hover:bg-primary-hover text-black font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <Edit className="w-5 h-5" />
                                        Düzenle
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => isJoined ? setIsJoined(false) : setIsJoinModalOpen(true)}
                                        className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold transition-all shadow-glow flex items-center justify-center gap-2 ${isJoined
                                            ? 'bg-muted text-foreground border-2 border-primary hover:bg-muted/80'
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
                                )}
                                <button
                                    onClick={() => setIsShareModalOpen(true)}
                                    className="px-4 py-3 glass rounded-xl hover:bg-muted transition-all text-foreground"
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
            <div className="container mx-auto px-4 py-12 flex-1">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="glass-strong p-6 rounded-xl text-center border border-border hover:border-primary/30 transition-colors">
                        <Users className={`w-8 h-8 ${config.color} mx-auto mb-2`} />
                        <div className="text-3xl font-bold text-foreground mb-1">{clubInfo.memberCount || 0}</div>
                        <div className="text-sm text-muted-foreground">Toplam Üye</div>
                    </div>
                    <div className="glass-strong p-6 rounded-xl text-center border border-border hover:border-primary/30 transition-colors">
                        <Calendar className={`w-8 h-8 ${config.color} mx-auto mb-2`} />
                        <div className="text-3xl font-bold text-foreground mb-1">{foundedYear}</div>
                        <div className="text-sm text-muted-foreground">Kuruluş Yılı</div>
                    </div>
                    <div className="glass-strong p-6 rounded-xl text-center border border-border hover:border-primary/30 transition-colors">
                        <Trophy className={`w-8 h-8 ${config.color} mx-auto mb-2`} />
                        <div className="text-3xl font-bold text-foreground mb-1">{clubEvents.length}</div>
                        <div className="text-sm text-muted-foreground">Etkinlik</div>
                    </div>
                    <div className="glass-strong p-6 rounded-xl text-center border border-border hover:border-primary/30 transition-colors">
                        <TrendingUp className={`w-8 h-8 ${config.color} mx-auto mb-2`} />
                        <div className="text-3xl font-bold text-foreground mb-1">{upcomingEvents.length}</div>
                        <div className="text-sm text-muted-foreground">Yaklaşan</div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About Section */}
                        <div className="glass-strong border border-border p-8 rounded-2xl">
                            <h2 className={`text-2xl font-bold mb-4 flex items-center gap-3 text-foreground`}>
                                <span className={`w-1 h-8 ${config.gradient} rounded-full`} />
                                Hakkımızda
                            </h2>
                            <p className="text-muted-foreground leading-relaxed mb-6 whitespace-pre-wrap">
                                {clubInfo.description || 'Bu kulüp hakkında henüz detaylı açıklama eklenmemiş.'}
                            </p>

                            {clubInfo.mission && (
                                <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                                    <h3 className="font-bold text-foreground mb-2">Misyonumuz</h3>
                                    <p className="text-muted-foreground text-sm">{clubInfo.mission}</p>
                                </div>
                            )}
                        </div>

                        {/* Events Section */}
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                                <Calendar className={`w-6 h-6 ${config.color}`} />
                                Yaklaşan Etkinlikler
                            </h2>
                            {upcomingEvents.length === 0 ? (
                                <div className="glass-strong border border-border p-12 rounded-2xl text-center">
                                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-foreground mb-2">Yaklaşan Etkinlik Yok</h3>
                                    <p className="text-muted-foreground text-sm">Bu kulübün yakında planlanmış etkinliği bulunmuyor.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {upcomingEvents.slice(0, 4).map((event) => (
                                        <div
                                            key={event.id}
                                            className="glass-strong p-4 rounded-xl border border-border hover:border-primary/30 transition-all hover:scale-105 group cursor-pointer bg-card"
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
                                            <h4 className="font-bold text-foreground mb-2 line-clamp-2">{event.title}</h4>
                                            <div className="flex items-center justify-between text-sm mt-3">
                                                <span className="text-muted-foreground flex items-center gap-1">
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
                                <div className="glass-strong border border-border p-6 rounded-2xl">
                                    <h3 className="font-bold text-foreground mb-4">İletişim</h3>
                                    <div className="space-y-3">
                                        {clubInfo.email && (
                                            <a
                                                href={`mailto:${clubInfo.email}`}
                                                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                                            >
                                                <Mail className="w-5 h-5 flex-shrink-0" />
                                                <span className="text-sm truncate">{clubInfo.email}</span>
                                            </a>
                                        )}
                                        {clubInfo.instagram && (
                                            <a
                                                href={`https://instagram.com/${clubInfo.instagram.replace('@', '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                                            >
                                                <Instagram className="w-5 h-5 flex-shrink-0" />
                                                <span className="text-sm">@{clubInfo.instagram.replace('@', '')}</span>
                                            </a>
                                        )}
                                        {clubInfo.website && (
                                            <a
                                                href={clubInfo.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                                            >
                                                <Globe className="w-5 h-5 flex-shrink-0" />
                                                <span className="text-sm truncate">{clubInfo.website.replace('https://', '')}</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Location */}
                            {clubInfo.location && (
                                <div className="glass-strong border border-border p-6 rounded-2xl">
                                    <h3 className="font-bold text-foreground mb-4">Lokasyon</h3>
                                    <div className="flex items-start gap-3 text-muted-foreground">
                                        <MapPin className={`w-5 h-5 flex-shrink-0 ${config.color}`} />
                                        <span className="text-sm">{clubInfo.location}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Kulüp Profili Düzenle"
                size="lg"
            >
                <form onSubmit={handleUpdateClub} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Images */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-foreground">Kulüp Logosu</label>
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 rounded-full border border-border overflow-hidden bg-muted">
                                    {previewLogo ? (
                                        <Image src={previewLogo} alt="Logo" fill className="object-cover" unoptimized />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-muted-foreground"><Users /></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'logo')}
                                        className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-primary file:text-black hover:file:bg-primary-hover file:cursor-pointer file:border-0 file:font-semibold"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-foreground">Kapak Resmi</label>
                            <div className="flex items-center gap-4">
                                <div className="relative w-full h-20 rounded-lg border border-border overflow-hidden bg-muted">
                                    {previewCover && (
                                        <Image src={previewCover} alt="Cover" fill className="object-cover" unoptimized />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'cover')}
                                        className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-primary file:text-black hover:file:bg-primary-hover file:cursor-pointer file:border-0 file:font-semibold"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Kulüp Adı</label>
                            <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Kategori</label>
                            <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                                {Object.keys(categoryConfig).map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Slogan</label>
                        <input type="text" value={editForm.slogan} onChange={e => setEditForm({ ...editForm, slogan: e.target.value })} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Kısa ve etkileyici bir söz" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Açıklama</label>
                        <textarea rows={4} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Kulübünüzü detaylıca anlatın" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Misyon</label>
                        <textarea rows={2} value={editForm.mission} onChange={e => setEditForm({ ...editForm, mission: e.target.value })} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Amacınız nedir?" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">E-posta</label>
                            <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Instagram (Kullanıcı Adı)</label>
                            <input type="text" value={editForm.instagram} onChange={e => setEditForm({ ...editForm, instagram: e.target.value })} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="@kullanici_adi" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Web Sitesi</label>
                            <input type="url" value={editForm.website} onChange={e => setEditForm({ ...editForm, website: e.target.value })} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Lokasyon/Ofis</label>
                            <input type="text" value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl transition-all shadow-lg hover:scroll-p-10"
                    >
                        {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </button>
                </form>
            </Modal>

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
                        <h3 className="text-2xl font-bold text-foreground mb-2">Başvurun Alındı!</h3>
                        <p className="text-muted-foreground">Kulüp yöneticileri en kısa sürede değerlendirecek.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <p className="text-muted-foreground">
                            <strong className="text-foreground">{clubInfo.name}</strong> kulübüne katılmak için başvurunuzu gönderin.
                        </p>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                Neden katılmak istiyorsunuz? <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={joinReason}
                                onChange={(e) => setJoinReason(e.target.value)}
                                className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-lg p-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none resize-none"
                                rows={4}
                                placeholder="Bu kulübe katılma sebebinizi kısaca açıklayın..."
                                required
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsJoinModalOpen(false)}
                                className="flex-1 px-4 py-3 glass rounded-xl border border-border text-foreground font-semibold hover:bg-muted transition-all"
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
                    <p className="text-muted-foreground text-sm">Bu kulübü arkadaşlarınla paylaş!</p>
                    <div className="flex gap-2">
                        <button className="flex-1 px-4 py-3 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg transition-all border border-border">
                            WhatsApp
                        </button>
                        <button className="flex-1 px-4 py-3 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg transition-all border border-border">
                            Instagram
                        </button>
                        <button className="flex-1 px-4 py-3 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg transition-all border border-border">
                            Link Kopyala
                        </button>
                    </div>
                </div>
            </Modal>

            <Footer />
        </div>
    );
}
