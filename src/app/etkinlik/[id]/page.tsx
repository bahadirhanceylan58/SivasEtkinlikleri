'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Calendar, MapPin, Clock, Share2, Phone, Navigation } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function EventDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    // Assuming totalTickets and totalPrice are managed elsewhere or will be added.
    // For now, defining them to make handlePurchase syntactically correct.
    const [totalTickets, setTotalTickets] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    const handlePurchase = () => {
        if (event.salesType === 'external' && event.externalUrl) {
            window.open(event.externalUrl, '_blank');
            return;
        }

        // Internal purchase logic
        router.push(`/odeme/${event.id}`);
    };

    useEffect(() => {
        const fetchEvent = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, 'events', id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setEvent({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <div className="text-xl animate-pulse">Yükleniyor...</div>
        </div>
    );

    if (!event) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <div className="text-xl">Etkinlik bulunamadı.</div>
        </div>
    );

    // Tarih Formatlama
    const eventDate = new Date(event.date);
    const dateStr = eventDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
    const timeStr = eventDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    return (
        <main className="bg-black min-h-screen text-white flex flex-col">
            <Navbar />

            <div className="flex-grow py-12">
                <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* SOL SÜTUN (Görsel ve Bilgi) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Görsel */}
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
                            <Image
                                src={event.imageUrl || 'https://via.placeholder.com/800x600'}
                                alt={event.title}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            <div className="absolute top-4 left-4 bg-yellow-500 text-black font-bold px-3 py-1 rounded-full text-sm">
                                {event.subCategory || event.category}
                            </div>
                        </div>
                        {/* Açıklama Başlığı */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <span className="w-1 h-8 bg-yellow-500 mr-3 rounded-full"></span>
                                Etkinlik Detayları
                            </h2>
                            <div className="bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800 leading-relaxed text-gray-300">
                                <p className="whitespace-pre-wrap">{event.description || "Bu etkinlik için detaylı açıklama girilmemiş."}</p>

                                <div className="mt-6 flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-neutral-800 rounded-full text-xs text-gray-400">#sivas</span>
                                    <span className="px-3 py-1 bg-neutral-800 rounded-full text-xs text-gray-400">#{event.category?.toLowerCase()}</span>
                                    <span className="px-3 py-1 bg-neutral-800 rounded-full text-xs text-gray-400">#etkinlik</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SAĞ SÜTUN (Bilet ve Lokasyon - Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">

                            {/* Başlık Kartı */}
                            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl">
                                <h1 className="text-2xl font-bold text-white mb-2">{event.title}</h1>
                                <div className="flex items-center text-gray-400 text-sm mb-4">
                                    <MapPin className="w-4 h-4 mr-1 text-yellow-500" />
                                    {event.location}
                                </div>

                                <div className="flex items-center justify-between py-4 border-t border-neutral-800">
                                    <div className="flex items-center">
                                        <Calendar className="w-5 h-5 text-yellow-500 mr-2" />
                                        <div>
                                            <div className="text-white font-medium">{dateStr}</div>
                                            <div className="text-xs text-gray-500">{timeStr}</div>
                                        </div>
                                    </div>
                                </div>
                                {/* Bilet Fiyatları */}
                                <div className="space-y-3 mt-4">
                                    {event.ticketTypes && event.ticketTypes.length > 0 ? (
                                        event.ticketTypes.map((ticket: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center bg-neutral-800/50 p-3 rounded-lg border border-neutral-700">
                                                <span className="text-gray-300">{ticket.name}</span>
                                                <span className="text-yellow-400 font-bold text-lg">{ticket.price} ₺</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-2 text-gray-400 bg-neutral-800/30 rounded">Bilet bilgisi girilmemiş</div>
                                    )}
                                </div>
                                <button
                                    onClick={handlePurchase}
                                    className="w-full mt-6 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(250,204,21,0.3)]"
                                >
                                    {event.salesType === 'external' ? 'Bilet Sitesine Git' : 'Bilet Satın Al'}
                                </button>

                                <div className="text-center mt-3 text-xs text-gray-500">
                                    Güvenli ödeme altyapısı ile
                                </div>
                            </div>
                            {/* Mekan Kartı */}
                            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
                                <h3 className="text-white font-bold mb-4 flex items-center">
                                    <MapPin className="w-5 h-5 text-yellow-500 mr-2" />
                                    Mekan Bilgisi
                                </h3>
                                <p className="text-gray-300 mb-4">{event.location}</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 text-white py-2 rounded-lg text-sm transition-colors">
                                        <Navigation className="w-4 h-4 mr-2" />
                                        Yol Tarifi
                                    </button>
                                    <button className="flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 text-white py-2 rounded-lg text-sm transition-colors">
                                        <Phone className="w-4 h-4 mr-2" />
                                        Ara
                                    </button>
                                </div>
                            </div>
                            {/* Organizatör / İletişim */}
                            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold">
                                        SE
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-white text-sm font-bold">Sivas Etkinlikleri</div>
                                        <div className="text-xs text-gray-500">Resmi Organizatör</div>
                                    </div>
                                </div>
                                <button className="text-neutral-400 hover:text-white">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
