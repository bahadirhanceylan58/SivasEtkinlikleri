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
        <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
            <Navbar />
            <div className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-foreground">Biletlerim</h1>

                {tickets.length === 0 ? (
                    <div className="text-muted-foreground text-center py-12 bg-muted/30 rounded-xl border border-border">
                        <p className="text-lg mb-4">Henüz biletiniz bulunmamaktadır.</p>
                        <button onClick={() => router.push('/')} className="text-primary hover:underline">
                            Etkinliklere Göz At
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 max-w-3xl mx-auto">
                        {tickets.map((ticket, index) => (
                            <div key={index} className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 hover:border-primary/50 transition-all group shadow-sm">

                                {/* Sol: Tarih Kutusu */}
                                <div className="bg-muted rounded-lg p-3 flex flex-col items-center justify-center min-w-[80px]">
                                    <span className="text-primary font-bold text-xl">
                                        {new Date(ticket.eventDate).getDate()}
                                    </span>
                                    <span className="text-xs uppercase text-muted-foreground">
                                        {new Date(ticket.eventDate).toLocaleDateString('tr-TR', { month: 'short' })}
                                    </span>
                                </div>
                                {/* Orta: Bilgiler */}
                                <div className="flex-grow">
                                    <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{ticket.eventTitle}</h3>
                                    <div className="text-sm text-muted-foreground mt-1 flex items-center">
                                        <MapPin className="w-4 h-4 mr-1 text-primary" />
                                        {ticket.eventLocation}
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                                        <span className="bg-muted px-2 py-0.5 rounded">{ticket.ticketCount} Adet</span>
                                        <span>•</span>
                                        <span>Toplam {ticket.totalAmount} ₺</span>
                                    </div>
                                </div>
                                {/* Sağ: Buton */}
                                <div className="flex items-center justify-end md:justify-center">
                                    <button
                                        onClick={() => setSelectedQr(ticket.qrCode)}
                                        className="bg-primary hover:bg-primary-hover text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap shadow-lg shadow-primary/10"
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
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setSelectedQr(null)}>
                    <div className="bg-card p-8 rounded-2xl flex flex-col items-center relative max-w-sm w-full animate-fadeIn border border-border" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedQr(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 transition-colors" aria-label="Kapat">
                            <X size={24} />
                        </button>
                        <h3 className="text-foreground font-bold mb-6 text-xl">Giriş Kodunuz</h3>
                        <div className="p-4 bg-white border-4 border-black rounded-xl">
                            <QRCodeSVG value={selectedQr} size={200} />
                        </div>

                        <div className="mt-6 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-4 py-2 rounded-lg text-center w-full">
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">Bilet Kodu</span>
                            <code className="text-lg font-mono font-bold text-neutral-900 dark:text-neutral-100 tracking-wider select-all break-all">
                                {selectedQr}
                            </code>
                        </div>

                        <p className="text-muted-foreground text-sm mt-4 text-center leading-relaxed">
                            Bu kodu etkinlik girişindeki<br />görevliye okutunuz.
                        </p>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}
