'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MapPin, Clock, Navigation, X, ZoomIn, ChevronLeft, ChevronRight, Plus, Minus, Phone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SocialShare from '@/components/SocialShare';
import CountdownTimer from '@/components/CountdownTimer';
import Modal from '@/components/Modal';
import SeatSelector from '@/components/SeatSelector';
import ReviewSection from '@/components/ReviewSection';
import SponsorSection from '@/components/SponsorSection';
import { Seat } from '@/types/seating';
import dynamic from 'next/dynamic';
import FavoriteButton from '@/components/FavoriteButton';

const MapViewer = dynamic(() => import('@/components/MapViewer'), {
    ssr: false,
    loading: () => <div className="h-48 w-full bg-neutral-900 animate-pulse rounded-2xl flex items-center justify-center text-gray-500">Harita yükleniyor...</div>
});

export default function EventDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [ticketQuantity, setTicketQuantity] = useState(1);
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
    const [seatTotalPrice, setSeatTotalPrice] = useState(0);

    const eventImages = event ? [event.imageUrl, event.imageUrl, event.imageUrl] : [];

    const handlePurchase = () => {
        // External link - open in new tab
        if (event.salesType === 'external' && event.externalUrl) {
            window.open(event.externalUrl, '_blank');
            return;
        }

        // Free events - just navigate to confirmation
        if (event.salesType === 'free') {
            router.push(`/odeme/${event.id}?type=free`);
            return;
        }

        // Reservation - navigate to reservation page
        if (event.salesType === 'reservation') {
            if (event.hasSeating) {
                sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
            }
            router.push(`/odeme/${event.id}?type=reservation&quantity=${ticketQuantity}`);
            return;
        }

        // Internal sales (default)
        if (event.hasSeating) {
            sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
        }
        router.push(`/odeme/${event.id}?quantity=${ticketQuantity}`);
    };

    useEffect(() => {
        const fetchEvent = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, 'events', id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const eventData = { id: docSnap.id, ...docSnap.data() };
                    setEvent(eventData);
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
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Etkinlik yükleniyor...</p>
            </div>
        </div>
    );

    if (!event) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <div className="text-center space-y-4">
                <p className="text-xl font-bold">Etkinlik bulunamadı.</p>
                <Link href="/" className="text-primary hover:text-primary-hover underline">
                    Ana Sayfaya Dön
                </Link>
            </div>
        </div>
    );

    return (
        <main className="bg-background min-h-screen text-foreground flex flex-col transition-colors duration-300">
            <Navbar />

            <div className="flex-grow py-12">
                <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* SOL SÜTUN */}
                    <div className="lg:col-span-2 space-y-8 animate-fadeIn">
                        {/* Image Carousel */}
                        <div className="space-y-4">
                            <div className="relative w-full h-[300px] md:h-[500px] glass rounded-2xl overflow-hidden border border-primary/20 hover:border-primary/40 shadow-xl group transition-all">
                                <Image
                                    src={eventImages[currentImageIndex] || 'https://via.placeholder.com/800x600'}
                                    alt={event.title}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                    priority
                                />

                                {eventImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setCurrentImageIndex((prev) => (prev - 1 + eventImages.length) % eventImages.length)}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <ChevronLeft className="w-6 h-6 text-white" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentImageIndex((prev) => (prev + 1) % eventImages.length)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <ChevronRight className="w-6 h-6 text-white" />
                                        </button>
                                    </>
                                )}

                                <div
                                    className="absolute bottom-4 right-4 glass-strong px-3 py-2 rounded-lg text-xs flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-foreground"
                                    onClick={() => setIsImageModalOpen(true)}
                                >
                                    <ZoomIn className="w-4 h-4" />
                                    Yakınlaştır
                                </div>

                                {eventImages.length > 1 && (
                                    <div className="absolute top-4 right-4 glass-strong px-3 py-1.5 rounded-lg text-xs text-foreground">
                                        {currentImageIndex + 1} / {eventImages.length}
                                    </div>
                                )}
                            </div>

                            {eventImages.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {eventImages.map((img: string, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === index
                                                ? 'border-primary scale-105'
                                                : 'border-border hover:border-primary/50 opacity-70 hover:opacity-100'
                                                }`}
                                        >
                                            <Image
                                                src={img || 'https://via.placeholder.com/100x100'}
                                                alt={`${event.title} - ${index + 1}`}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Countdown Timer */}
                        {new Date(event.date) > new Date() && (
                            <div className="glass-strong border border-border rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" />
                                    Etkinliğe Kalan Süre
                                </h3>
                                <CountdownTimer targetDate={event.date} />
                            </div>
                        )}

                        {/* Açıklama */}
                        {/* OPACITY-0 KALDIRILDI */}
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                                <span className="w-1 h-8 bg-primary rounded-full" />
                                Etkinlik Detayları
                            </h2>
                            <div className="glass-strong p-6 rounded-2xl border border-border leading-relaxed text-muted-foreground">
                                <p className="whitespace-pre-wrap">{event.description || "Bu etkinlik için detaylı açıklama girilmemiş."}</p>

                                <div className="mt-6 flex flex-wrap gap-2">
                                    <span className="px-3 py-1 glass rounded-full text-xs text-muted-foreground hover:bg-muted/10 transition-colors">#sivas</span>
                                    <span className="px-3 py-1 glass rounded-full text-xs text-muted-foreground hover:bg-muted/10 transition-colors">#{event.category?.toLowerCase() || 'etkinlik'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Koltuk Seçimi */}
                        {event.hasSeating && event.seatingConfig && (
                            // OPACITY-0 KALDIRILDI
                            <div>
                                <div className="glass-strong border border-border rounded-2xl p-6">
                                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                                        <span className="w-1 h-8 bg-primary rounded-full" />
                                        İnteraktif Koltuk Seçimi
                                    </h2>
                                    <SeatSelector
                                        eventId={event.id}
                                        seatingConfig={event.seatingConfig}
                                        onSelectionChange={(seats: Seat[], totalPrice: number) => {
                                            setSelectedSeats(seats);
                                            setSeatTotalPrice(totalPrice);
                                        }}
                                        onProceedToPayment={handlePurchase}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Değerlendirmeler Section */}
                        {/* OPACITY-0 KALDIRILDI */}
                        <div>
                            <ReviewSection eventId={event.id} />
                        </div>
                    </div>

                    {/* SAĞ SÜTUN */}
                    <div>
                        {/* BURASI DÜZELTİLDİ: Animasyon ve opacity-0 silindi, sticky kaldı */}
                        <div className="sticky top-24 space-y-6">

                            {/* Title & Favorite */}
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground leading-tight mb-2">{event.title}</h1>
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-medium text-xs uppercase">{event.category}</span>
                                        <span>•</span>
                                        <span>{new Date(event.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                </div>
                                <FavoriteButton eventId={event.id} className="flex-shrink-0" iconSize={24} />
                            </div>

                            {/* Bilet Satın Al Kutusu */}
                            <div className="glass-strong border border-border p-6 rounded-2xl">
                                {/* Free Event */}
                                {event.salesType === 'free' && (
                                    <>
                                        <div className="text-center space-y-3 py-2">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                                                <span className="text-2xl">🎉</span>
                                                <span className="text-green-500 font-bold">Ücretsiz Etkinlik</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">Bu etkinliğe katılım tamamen ücretsizdir!</p>
                                        </div>
                                        <button
                                            onClick={handlePurchase}
                                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2 mt-4"
                                        >
                                            Katıl
                                        </button>
                                    </>
                                )}

                                {/* Reservation */}
                                {event.salesType === 'reservation' && (
                                    <>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-foreground">Kişi Sayısı</label>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => setTicketQuantity(q => Math.max(1, q - 1))}
                                                    disabled={ticketQuantity <= 1}
                                                    className="w-12 h-12 rounded-lg bg-card hover:bg-muted border border-border hover:border-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <Minus className="w-5 h-5 mx-auto text-foreground" />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={ticketQuantity}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 1;
                                                        setTicketQuantity(Math.max(1, Math.min(10, val)));
                                                    }}
                                                    className="w-20 text-center text-2xl font-bold bg-background border-2 border-border rounded-lg py-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                                    min="1"
                                                    max="10"
                                                />
                                                <button
                                                    onClick={() => setTicketQuantity(q => Math.min(10, q + 1))}
                                                    disabled={ticketQuantity >= 10}
                                                    className="w-12 h-12 rounded-lg bg-card hover:bg-muted border border-border hover:border-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <Plus className="w-5 h-5 mx-auto text-foreground" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Maksimum 10 kişi rezerve edebilirsiniz</p>
                                        </div>

                                        <button
                                            onClick={handlePurchase}
                                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2 mt-4"
                                        >
                                            Rezervasyon Yap ({ticketQuantity} Kişi)
                                        </button>
                                    </>
                                )}

                                {/* Internal Sales */}
                                {event.salesType === 'internal' && (
                                    <>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-foreground">Bilet Adedi</label>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => setTicketQuantity(q => Math.max(1, q - 1))}
                                                    disabled={ticketQuantity <= 1}
                                                    className="w-12 h-12 rounded-lg bg-card hover:bg-muted border border-border hover:border-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <Minus className="w-5 h-5 mx-auto text-foreground" />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={ticketQuantity}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 1;
                                                        setTicketQuantity(Math.max(1, Math.min(10, val)));
                                                    }}
                                                    className="w-20 text-center text-2xl font-bold bg-card border border-border rounded-lg py-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                                    min="1"
                                                    max="10"
                                                />
                                                <button
                                                    onClick={() => setTicketQuantity(q => Math.min(10, q + 1))}
                                                    disabled={ticketQuantity >= 10}
                                                    className="w-12 h-12 rounded-lg bg-card hover:bg-muted border border-border hover:border-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <Plus className="w-5 h-5 mx-auto text-foreground" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Maksimum 10 bilet seçebilirsiniz</p>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-border mt-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-foreground">Bilet Fiyatı</span>
                                                <span className="text-foreground font-medium">₺{event.ticketTypes?.[0]?.price || 0}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-foreground">Adet</span>
                                                <span className="text-foreground font-medium">x {ticketQuantity}</span>
                                            </div>
                                            <div className="flex justify-between pt-3 border-t border-border">
                                                <span className="text-foreground font-bold">Toplam</span>
                                                <span className="text-2xl font-bold text-primary">₺{(event.ticketTypes?.[0]?.price || 0) * ticketQuantity}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handlePurchase}
                                            className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2 mt-4"
                                        >
                                            Satın Al (₺{(event.ticketTypes?.[0]?.price || 0) * ticketQuantity})
                                        </button>
                                    </>
                                )}

                                {/* External Link */}
                                {event.salesType === 'external' && (
                                    <button
                                        onClick={handlePurchase}
                                        className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2"
                                    >
                                        Bilet Sitesine Git
                                    </button>
                                )}
                            </div>

                            {/* Mekan Kartı */}
                            <div className="glass-strong border border-border p-6 rounded-2xl">
                                <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    Mekan Bilgisi
                                </h3>
                                <p className="text-muted-foreground mb-4">{event.location}</p>

                                {event.coordinates && (
                                    <div className="h-48 w-full mb-4 rounded-xl overflow-hidden border border-border">
                                        <MapViewer position={[event.coordinates.lat, event.coordinates.lng]} title={event.location} />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => {
                                            const query = event.coordinates
                                                ? `${event.coordinates.lat},${event.coordinates.lng}`
                                                : encodeURIComponent(event.location);
                                            window.open(`http://maps.google.com/?q=${query}`, '_blank');
                                        }}
                                        className="flex items-center justify-center glass hover:bg-muted/10 text-foreground py-2 rounded-lg text-sm transition-all hover:scale-105 border border-border"
                                    >
                                        <Navigation className="w-4 h-4 mr-2" />
                                        Yol Tarifi
                                    </button>
                                    <button className="flex items-center justify-center glass hover:bg-muted/10 text-foreground py-2 rounded-lg text-sm transition-all hover:scale-105 border border-border">
                                        <Phone className="w-4 h-4 mr-2" />
                                        Ara
                                    </button>
                                </div>
                            </div>

                            {/* Organizatör */}
                            <div className="glass-strong border border-border p-5 rounded-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                            SE
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-foreground text-sm font-bold">Sivas Etkinlikleri</div>
                                            <div className="text-xs text-muted-foreground">Resmi Organizatör</div>
                                        </div>
                                    </div>
                                </div>
                                <SocialShare
                                    eventTitle={event.title}
                                    eventUrl={typeof window !== 'undefined' ? window.location.href : ''}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {isImageModalOpen && (
                <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsImageModalOpen(false)}>
                    <button
                        onClick={() => setIsImageModalOpen(false)}
                        className="absolute top-4 right-4 p-3 glass-strong rounded-full hover:bg-white/20 transition-colors z-10 group"
                    >
                        <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </button>
                    <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
                        <Image
                            src={event.imageUrl || 'https://via.placeholder.com/800x600'}
                            alt={event.title}
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </div>
                </div>
            )}

            {/* Share Modal */}
            <Modal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                title="Etkinliği Paylaş"
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-muted-foreground text-sm">Bu etkinliği sosyal medyada paylaşın:</p>
                    <SocialShare
                        eventTitle={event.title}
                        eventUrl={typeof window !== 'undefined' ? window.location.href : ''}
                    />
                </div>
            </Modal>

            <Footer />
        </main>
    );
}