"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle, XCircle, Calendar, Users, AlertCircle } from "lucide-react";

export default function AdminApprovals() {
    const [pendingEvents, setPendingEvents] = useState<any[]>([]);
    const [pendingClubs, setPendingClubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            // Bekleyen Etkinlikler
            const eventQ = query(collection(db, "events"), where("status", "==", "pending"));
            const eventSnaps = await getDocs(eventQ);
            setPendingEvents(eventSnaps.docs.map(d => ({ id: d.id, ...d.data() })));

            // Bekleyen Kulüpler
            const clubQ = query(collection(db, "clubs"), where("status", "==", "pending"));
            const clubSnaps = await getDocs(clubQ);
            setPendingClubs(clubSnaps.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (error) {
            console.error("Veri çekme hatası", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Onaylama Fonksiyonu
    const handleApprove = async (collectionName: string, id: string) => {
        if (!confirm("Bu içeriği yayınlamak istiyor musunuz?")) return;
        try {
            await updateDoc(doc(db, collectionName, id), { status: "approved" });
            alert("İçerik onaylandı ve yayına alındı! 🚀");
            fetchData(); // Listeyi yenile
        } catch (error) {
            alert("Hata oluştu.");
        }
    };

    // Reddetme (Silme) Fonksiyonu
    const handleReject = async (collectionName: string, id: string) => {
        if (!confirm("Bu başvuruyu silmek istediğinize emin misiniz?")) return;
        try {
            await deleteDoc(doc(db, collectionName, id));
            alert("Başvuru silindi.");
            fetchData();
        } catch (error) {
            alert("Hata oluştu.");
        }
    };

    return (
        <div className="p-6 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <AlertCircle className="text-yellow-500" /> Onay Bekleyenler
            </h1>

            {/* --- ETKİNLİK ONAYLARI --- */}
            <div className="mb-12">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-gray-700 pb-2">
                    <Calendar className="text-primary" /> Etkinlik Başvuruları ({pendingEvents.length})
                </h2>

                {pendingEvents.length === 0 ? (
                    <p className="text-gray-500">Bekleyen etkinlik başvurusu yok.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingEvents.map((item) => (
                            <div key={item.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg">{item.title}</h3>
                                        <p className="text-sm text-gray-400">{item.ownerName} tarafından eklendi.</p>
                                        <p className="text-xs text-gray-500 mt-1">{item.date} - {item.location}</p>
                                    </div>
                                    <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded">Bekliyor</span>
                                </div>

                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => handleApprove("events", item.id)}
                                        className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <CheckCircle size={18} /> Onayla
                                    </button>
                                    <button
                                        onClick={() => handleReject("events", item.id)}
                                        className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <XCircle size={18} /> Reddet
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- KULÜP ONAYLARI --- */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-gray-700 pb-2">
                    <Users className="text-purple-500" /> Kulüp Başvuruları ({pendingClubs.length})
                </h2>

                {pendingClubs.length === 0 ? (
                    <p className="text-gray-500">Bekleyen kulüp başvurusu yok.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pendingClubs.map((item) => (
                            <div key={item.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                        <p className="text-sm text-gray-400">{item.ownerName} tarafından kuruldu.</p>
                                        <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                                    </div>
                                    <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded">Bekliyor</span>
                                </div>

                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => handleApprove("clubs", item.id)}
                                        className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <CheckCircle size={18} /> Onayla
                                    </button>
                                    <button
                                        onClick={() => handleReject("clubs", item.id)}
                                        className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <XCircle size={18} /> Reddet
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
