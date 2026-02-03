"use client";

import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { PlusCircle, Edit, Trash2, Calendar, Users, LayoutDashboard, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [events, setEvents] = useState<any[]>([]);
    const [clubs, setClubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Verileri Çek
    useEffect(() => {
        async function fetchData() {
            if (!user) return;

            try {
                // 1. Etkinliklerim
                const eventq = query(collection(db, "events"), where("ownerId", "==", user.uid));
                const eventSnaps = await getDocs(eventq);
                setEvents(eventSnaps.docs.map(d => ({ id: d.id, ...d.data() })));

                // 2. Kulüplerim
                const clubq = query(collection(db, "clubs"), where("ownerId", "==", user.uid));
                const clubSnaps = await getDocs(clubq);
                setClubs(clubSnaps.docs.map(d => ({ id: d.id, ...d.data() })));

            } catch (error) {
                console.error("Veri çekme hatası:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user]);

    // Silme Fonksiyonu
    const handleDelete = async (collectionName: string, id: string) => {
        if (!confirm("Bunu silmek istediğinize emin misiniz?")) return;
        try {
            await deleteDoc(doc(db, collectionName, id));
            // Listeyi güncelle
            if (collectionName === 'events') setEvents(events.filter(e => e.id !== id));
            if (collectionName === 'clubs') setClubs(clubs.filter(c => c.id !== id));
        } catch (error) {
            alert("Silinirken hata oluştu.");
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            <div className="container mx-auto px-4 py-8 flex-1 pt-24">

                {/* Başlık */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                        <LayoutDashboard className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Yönetim Paneli</h1>
                        <p className="text-gray-400 text-sm">İçeriklerini buradan yönetebilirsin.</p>
                    </div>
                </div>

                {/* Hızlı Ekleme Butonları */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <Link href="/etkinlik-olustur" className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-zinc-800 transition-all group">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                            <PlusCircle className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-sm">Etkinlik Oluştur</span>
                    </Link>
                    <Link href="/kulup-olustur" className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-zinc-800 transition-all group">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <PlusCircle className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-sm">Kulüp Kur</span>
                    </Link>
                </div>

                {/* --- ETKİNLİKLERİM LİSTESİ --- */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                        <Calendar className="w-5 h-5" /> Etkinliklerim
                    </h2>

                    {loading ? (
                        <div className="text-gray-500 text-sm">Yükleniyor...</div>
                    ) : events.length === 0 ? (
                        <div className="bg-zinc-900/50 p-6 rounded-2xl text-center border border-zinc-800">
                            <p className="text-gray-400 mb-2">Henüz etkinlik oluşturmadın.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {events.map(event => (
                                <div key={event.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-white">{event.title}</h3>
                                        <p className="text-xs text-gray-400">
                                            {event.status === 'pending' ? <span className="text-yellow-500">Onay Bekliyor</span> : <span className="text-green-500">Yayında</span>}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Düzenle (İleride yapılabilir) */}
                                        <button className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        {/* Sil */}
                                        <button
                                            onClick={() => handleDelete('events', event.id)}
                                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- KULÜPLERİM LİSTESİ --- */}
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-400">
                        <Users className="w-5 h-5" /> Kulüplerim
                    </h2>

                    {clubs.length === 0 ? (
                        <div className="bg-zinc-900/50 p-6 rounded-2xl text-center border border-zinc-800">
                            <p className="text-gray-400">Henüz bir kulübün yok.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {clubs.map(club => (
                                <div key={club.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-white">{club.name}</h3>
                                        <p className="text-xs text-gray-400">{club.category}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete('clubs', club.id)}
                                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
            <Footer />
        </div>
    );
}
