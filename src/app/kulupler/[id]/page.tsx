"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Users, Calendar, MapPin, Share2, Edit, LogOut, UserPlus, Trophy, AlertCircle, CalendarPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { user } = useAuth();
    const router = useRouter();
    const [club, setClub] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [clubId, setClubId] = useState<string | null>(null);

    // Params handling for Next.js 15+ (async params)
    useEffect(() => {
        async function resolveParams() {
            const resolvedParams = await params;
            setClubId(resolvedParams.id);
        }
        resolveParams();
    }, [params]);

    // Verileri Çek
    useEffect(() => {
        if (!clubId) return;

        async function fetchData() {
            try {
                // Kulüp Bilgisi
                const docRef = doc(db, "clubs", clubId!);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setClub({ id: docSnap.id, ...docSnap.data() });

                    // Bu kulübe ait etkinlikleri çek
                    const q = query(collection(db, "events"), where("clubId", "==", clubId));
                    const querySnapshot = await getDocs(q);
                    setEvents(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }
            } catch (error) {
                console.error("Veri hatası:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [clubId]);

    // Katıl / Ayrıl İşlemi
    const handleMembership = async () => {
        if (!user) return router.push("/login");
        if (!clubId) return;
        setJoining(true);

        const docRef = doc(db, "clubs", clubId);
        const isMember = club.members?.includes(user.uid);

        try {
            if (isMember) {
                // Ayrıl
                await updateDoc(docRef, { members: arrayRemove(user.uid) });
                setClub({ ...club, members: club.members.filter((id: string) => id !== user.uid) });
                alert("Kulüpten ayrıldınız.");
            } else {
                // Katıl
                await updateDoc(docRef, { members: arrayUnion(user.uid) });
                setClub({ ...club, members: [...(club.members || []), user.uid] });
                alert("Kulübe hoş geldiniz! 🎉");
            }
        } catch (error) {
            console.error(error);
            alert("Bir hata oluştu.");
        } finally {
            setJoining(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Yükleniyor...</div>;
    if (!club) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Kulüp bulunamadı.</div>;

    const isOwner = user?.uid === club.ownerId;
    const isMember = club.members?.includes(user?.uid);

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            <Navbar />

            {/* --- HERO / BANNER BÖLÜMÜ --- */}
            <div className="relative w-full h-[350px] md:h-[450px]">
                {/* Arka Plan Resmi */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black z-10"></div>
                <img
                    src={club.imageUrl || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop"}
                    alt={club.name}
                    className="w-full h-full object-cover opacity-60"
                />

                {/* Profil ve Başlık Alanı */}
                <div className="absolute bottom-0 left-0 w-full z-20 container mx-auto px-4 pb-8 flex flex-col md:flex-row items-end md:items-center gap-6">
                    {/* Logo */}
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-black bg-zinc-800 flex items-center justify-center overflow-hidden shadow-2xl shrink-0">
                        {club.logoUrl ? (
                            <img src={club.logoUrl} className="w-full h-full object-cover" />
                        ) : (
                            <Users size={40} className="text-gray-400" />
                        )}
                    </div>

                    {/* İsim ve Rozetler */}
                    <div className="flex-1 mb-2">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">{club.name}</h1>
                            <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{club.category}</span>
                        </div>
                        <p className="text-gray-300 text-lg max-w-2xl line-clamp-2">{club.description}</p>
                    </div>

                    {/* Aksiyon Butonları */}
                    <div className="flex items-center gap-3 mb-2 w-full md:w-auto">
                        {isOwner ? (
                            <>
                                <Link href={`/kulupler/duzenle/${club.id}`} className="flex-1 md:flex-none bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-105">
                                    <Edit size={20} /> Düzenle
                                </Link>
                                <Link
                                    href={`/etkinlik-olustur?clubId=${club.id}&clubName=${encodeURIComponent(club.name)}`}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-105"
                                >
                                    <CalendarPlus size={20} /> Etkinlik Oluştur
                                </Link>
                            </>
                        ) : (
                            <button
                                onClick={handleMembership}
                                disabled={joining}
                                className={`flex-1 md:flex-none font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-105 ${isMember ? 'bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500/20' : 'bg-yellow-500 hover:bg-yellow-400 text-black'}`}
                            >
                                {joining ? "İşleniyor..." : isMember ? <><LogOut size={20} /> Ayrıl</> : <><UserPlus size={20} /> Katıl</>}
                            </button>
                        )}
                        <button className="p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 text-white transition-colors">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* --- İSTATİSTİK KARTLARI --- */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-center hover:border-zinc-700 transition-colors">
                        <Users className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                        <h3 className="text-3xl font-bold text-white">{club.members?.length || 0}</h3>
                        <p className="text-gray-500 text-sm mt-1">Toplam Üye</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-center hover:border-zinc-700 transition-colors">
                        <Calendar className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                        <h3 className="text-3xl font-bold text-white">2026</h3>
                        <p className="text-gray-500 text-sm mt-1">Kuruluş Yılı</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-center hover:border-zinc-700 transition-colors">
                        <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                        <h3 className="text-3xl font-bold text-white">{events.length}</h3>
                        <p className="text-gray-500 text-sm mt-1">Toplam Etkinlik</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-center hover:border-zinc-700 transition-colors">
                        <div className="w-8 h-8 text-green-500 mx-auto mb-3 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                        </div>
                        <h3 className="text-3xl font-bold text-white">Aktif</h3>
                        <p className="text-gray-500 text-sm mt-1">Kulüp Durumu</p>
                    </div>
                </div>

                {/* --- İÇERİK: HAKKIMIZDA & ETKİNLİKLER --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* SOL: Hakkında ve İletişim */}
                    <div className="space-y-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><AlertCircle size={20} className="text-primary" /> Hakkımızda</h3>
                            <p className="text-gray-400 leading-relaxed">
                                {club.description || "Bu kulüp hakkında henüz detaylı bilgi girilmemiş."}
                            </p>

                            <div className="mt-6 pt-6 border-t border-zinc-800">
                                <h4 className="font-bold mb-3 text-white">İletişim & Sosyal</h4>
                                <div className="space-y-3">
                                    {/* Örnek Linkler - Gerçekte veritabanından çekilebilir */}
                                    <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                                        <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center"><MapPin size={16} /></div>
                                        <span>Sivas Cumhuriyet Üniversitesi</span>
                                    </a>
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">@</div>
                                        <span>{club.email || "E-posta yok"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SAĞ: Etkinlikler Listesi */}
                    <div className="lg:col-span-2">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Calendar className="text-yellow-500" /> Yaklaşan Etkinlikler
                        </h3>

                        {events.length === 0 ? (
                            <div className="bg-zinc-900/30 border border-zinc-800 border-dashed rounded-3xl p-12 text-center">
                                <Calendar className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                                <h4 className="text-xl font-bold text-gray-500">Planlanmış Etkinlik Yok</h4>
                                <p className="text-gray-600 mt-2">Bu kulüp henüz bir etkinlik yayınlamamış.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {events.map((event) => (
                                    <Link href={`/etkinlikler/${event.id}`} key={event.id} className="group bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex gap-4 hover:border-yellow-500/50 transition-all">
                                        <div className="w-24 h-24 bg-zinc-800 rounded-xl overflow-hidden shrink-0">
                                            <img src={event.imageUrl || "/placeholder.jpg"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1 py-1">
                                            <h4 className="text-lg font-bold group-hover:text-yellow-500 transition-colors">{event.title}</h4>
                                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{event.description}</p>
                                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 font-medium">
                                                <span className="flex items-center gap-1"><Calendar size={14} /> {event.date}</span>
                                                <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
                                            </div>
                                        </div>
                                        <div className="hidden md:flex items-center px-4">
                                            <span className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center text-gray-400 group-hover:bg-yellow-500 group-hover:text-black group-hover:border-yellow-500 transition-all">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
