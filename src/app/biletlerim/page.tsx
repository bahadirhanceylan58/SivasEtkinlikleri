'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function MyTicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedQr, setSelectedQr] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push('/login');
                return;
            }

            try {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().tickets) {
                    // Biletleri tarihe göre (en yeni en üstte) sırala
                    const sortedTickets = docSnap.data().tickets.reverse();
                    setTickets(sortedTickets);
                }
            } catch (error) {
                console.error("Error fetching tickets:", error);
            } finally {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <div className="text-xl animate-pulse">Biletler yükleniyor...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />
            <div className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Biletlerim</h1>

                {tickets.length === 0 ? (
                    <div className="text-gray-500 text-center py-12 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-lg mb-4">Henüz biletiniz bulunmamaktadır.</p>
                        <button onClick={() => router.push('/')} className="text-primary hover:underline">
                            Etkinliklere Göz At
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 max-w-3xl mx-auto">
                        {tickets.map((ticket, index) => (
                            <div key={index} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 hover:border-yellow-500/50 transition-all group">

                                {/* Sol: Tarih Kutusu */}
                                <div className="bg-neutral-800 rounded-lg p-3 flex flex-col items-center justify-center min-w-[80px]">
                                    <span className="text-yellow-500 font-bold text-xl">
                                        {new Date(ticket.eventDate).getDate()}
                                    </span>
                                    <span className="text-xs uppercase text-gray-400">
                                        {new Date(ticket.eventDate).toLocaleDateString('tr-TR', { month: 'short' })}
                                    </span>
                                </div>
                                {/* Orta: Bilgiler */}
                                <div className="flex-grow">
                                    <h3 className="font-bold text-white text-lg group-hover:text-yellow-500 transition-colors">{ticket.eventTitle}</h3>
                                    <div className="text-sm text-gray-400 mt-1 flex items-center">
                                        <MapPin className="w-4 h-4 mr-1 text-yellow-500" />
                                        {ticket.eventLocation}
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                                        <span className="bg-white/10 px-2 py-0.5 rounded">{ticket.ticketCount} Adet</span>
                                        <span>•</span>
                                        <span>Toplam {ticket.totalAmount} ₺</span>
                                    </div>
                                </div>
                                {/* Sağ: Buton */}
                                <div className="flex items-center justify-end md:justify-center">
                                    <button
                                        onClick={() => setSelectedQr(ticket.qrCode)}
                                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap shadow-lg shadow-yellow-500/10"
                                    >
                                        QR Göster
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* QR Kod Modal (Pencere) */}
            {selectedQr && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setSelectedQr(null)}>
                    <div className="bg-white p-8 rounded-2xl flex flex-col items-center relative max-w-sm w-full animate-fadeIn" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedQr(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors" aria-label="Kapat">
                            <X size={24} />
                        </button>
                        <h3 className="text-black font-bold mb-6 text-xl">Giriş Kodunuz</h3>
                        <div className="p-4 bg-white border-4 border-black rounded-xl">
                            <QRCodeSVG value={selectedQr} size={200} />
                        </div>
                        <p className="text-gray-500 text-sm mt-6 text-center leading-relaxed">
                            Bu kodu etkinlik girişindeki<br />görevliye okutunuz.
                        </p>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}
