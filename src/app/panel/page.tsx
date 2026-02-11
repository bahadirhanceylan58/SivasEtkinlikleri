"use client";

import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { PlusCircle, Edit, Trash2, Calendar, Users, LayoutDashboard, GraduationCap, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import EventAttendeesModal from "@/components/panel/EventAttendeesModal";

export default function UserDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [events, setEvents] = useState<any[]>([]);
    const [clubs, setClubs] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]); // Yeni: Kurslar
    const [dataLoading, setDataLoading] = useState(true);

    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [selectedEventTitle, setSelectedEventTitle] = useState("");

    // Auth Check
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

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

                // 3. Kurslarım (YENİ)
                const courseq = query(collection(db, "courses"), where("ownerId", "==", user.uid));
                const courseSnaps = await getDocs(courseq);
                setCourses(courseSnaps.docs.map(d => ({ id: d.id, ...d.data() })));

            } catch (error) {
                console.error("Veri çekme hatası:", error);
            } finally {
                setDataLoading(false);
            }
        }
        if (user) {
            fetchData();
        }
    }, [user]);

    // Silme Fonksiyonu
    const handleDelete = async (collectionName: string, id: string) => {
        if (!confirm("Bunu silmek istediğinize emin misiniz?")) return;
        try {
            await deleteDoc(doc(db, collectionName, id));
            // Listeyi güncelle
            if (collectionName === 'events') setEvents(events.filter(e => e.id !== id));
            if (collectionName === 'clubs') setClubs(clubs.filter(c => c.id !== id));
            if (collectionName === 'courses') setCourses(courses.filter(c => c.id !== id));
        } catch (error) {
            alert("Silinirken hata oluştu.");
        }
    };

    if (authLoading || (!user && dataLoading)) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Yükleniyor...</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            {/* Modal */}
            {selectedEventId && (
                <EventAttendeesModal
                    eventId={selectedEventId}
                    eventTitle={selectedEventTitle}
                    onClose={() => {
                        setSelectedEventId(null);
                        setSelectedEventTitle("");
                    }}
                />
            )}

            <div className="container mx-auto px-4 py-8 flex-1">

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

                {/* Bilgilendirme Kutusu */}
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-8 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300 space-y-2">
                        <p className="font-bold text-blue-400">Panel Kullanımı</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-purple-500/10 rounded-lg"><Users className="w-3.5 h-3.5 text-purple-400" /></div>
                                <span><span className="font-medium text-white">Katılımcılar:</span> Bilet alanları listeler.</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-500/10 rounded-lg"><Edit className="w-3.5 h-3.5 text-blue-400" /></div>
                                <span><span className="font-medium text-white">Düzenle:</span> İçeriği günceller.</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-red-500/10 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-500" /></div>
                                <span><span className="font-medium text-white">Sil:</span> İçeriği kaldırır.</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hızlı Ekleme Butonları */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
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
                    {/* Kurs Oluştur Butonu (Opsiyonel, varsa link verilebilir) */}
                    <button className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-sm">Kurs Aç (Yakında)</span>
                    </button>
                </div>

                {/* --- ETKİNLİKLERİM LİSTESİ --- */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                        <Calendar className="w-5 h-5" /> Etkinliklerim
                    </h2>

                    {dataLoading ? (
                        <div className="text-gray-500 text-sm">Yükleniyor...</div>
                    ) : events.length === 0 ? (
                        <div className="bg-zinc-900/50 p-6 rounded-2xl text-center border border-zinc-800">
                            <p className="text-gray-400 mb-2">Henüz etkinlik oluşturmadın.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {events.map(event => (
                                <div key={event.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between group hover:border-zinc-700 transition-all">
                                    <div>
                                        <h3 className="font-bold text-white group-hover:text-primary transition-colors">{event.title}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <p className="text-xs text-gray-400">
                                                {event.status === 'pending' ? <span className="text-yellow-500">Onay Bekliyor</span> : <span className="text-green-500">Yayında</span>}
                                            </p>
                                            <span className="text-zinc-600 text-[10px]">•</span>
                                            <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString('tr-TR')}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedEventId(event.id);
                                                setSelectedEventTitle(event.title);
                                            }}
                                            className="px-3 py-2 bg-purple-500/10 text-purple-400 rounded-lg hover:bg-purple-500/20 flex items-center gap-2 text-sm font-medium transition-colors"
                                            title="Katılımcıları Gör"
                                        >
                                            <Users className="w-4 h-4" />
                                            <span className="hidden md:inline">Katılımcılar</span>
                                        </button>
                                        <button className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors" title="Düzenle">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete('events', event.id)}
                                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                            title="Sil"
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
                <div className="mb-10">
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

                {/* --- KURSLARIM LİSTESİ (YENİ) --- */}
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
                        <GraduationCap className="w-5 h-5" /> Kurslarım
                    </h2>

                    {courses.length === 0 ? (
                        <div className="bg-zinc-900/50 p-6 rounded-2xl text-center border border-zinc-800">
                            <p className="text-gray-400">Henüz bir kurs oluşturmadın.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {courses.map(course => (
                                <div key={course.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-white">{course.title}</h3>
                                        <p className="text-xs text-gray-400">{course.instructor}</p>
                                        <p className="text-xs mt-1">
                                            {course.status === 'published' ? <span className="text-green-500">Yayında</span> : <span className="text-yellow-500">Onay Bekliyor</span>}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Düzenle Butonu - Link eklendi */}
                                        <Link href={`/kurslar/duzenle/${course.id}`} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 flex items-center justify-center">
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        {/* Sil Butonu */}
                                        <button
                                            onClick={() => handleDelete('courses', course.id)}
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
