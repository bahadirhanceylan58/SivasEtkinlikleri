'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, arrayUnion, setDoc, addDoc, collection } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Image from 'next/image';
import { Phone, User, Ticket, Users as UsersIcon, Armchair, TrendingDown } from 'lucide-react';
import DiscountCodeInput from '@/components/DiscountCodeInput';
import { DiscountValidationResult } from '@/types/ticketing';
import { calculateGroupDiscount, getNextTierInfo } from '@/lib/groupTickets';
import { Seat } from '@/types/seating';
import { markSeatsAsSold, formatSeatName } from '@/lib/seatUtils';

interface Event {
    id: string;
    title: string;
    location: string;
    date: string;
    imageUrl?: string;
    description?: string;
    category?: string;
    price: number;
    groupTickets?: any[];
    hasSeating?: boolean;
    seatingConfig?: any;
    ticketTypes?: Array<{ name: string; price: number }>;
}

export default function PaymentPage() {
    const { id } = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [user, setUser] = useState<any>(null); // TODO: Define User type
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [fullName, setFullName] = useState('');

    const [ticketCount, setTicketCount] = useState(1);
    const ticketPrice = 150;

    // İndirim kodu state'leri
    const [appliedDiscount, setAppliedDiscount] = useState<DiscountValidationResult | null>(null);
    const [appliedDiscountCode, setAppliedDiscountCode] = useState<string | null>(null);

    // Grup indirimi tier'ları (normalde event'ten gelir, şimdilik varsayılan)
    const groupTiers = event?.groupTickets || [
        { id: '1', name: 'Küçük Grup', minTickets: 5, discount: 0.10, description: 'Aile paketi' },
        { id: '2', name: 'Orta Grup', minTickets: 10, discount: 0.15, description: 'Arkadaş grubu' },
        { id: '3', name: 'Büyük Grup', minTickets: 20, discount: 0.20, description: 'Toplu alım' }
    ];

    // Koltuk seçimi - yeni sistem
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
    const [seatTotalPrice, setSeatTotalPrice] = useState(0);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                alert('Bilet almak için giriş yapmalısınız!');
                router.push('/login');
            } else {
                setUser(currentUser);
                // Eğer kullanıcının ismi varsa otomatik doldur
                if (currentUser.displayName) setFullName(currentUser.displayName);
            }
        });

        const fetchEvent = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, 'events', id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setEvent({ id: docSnap.id, ...docSnap.data() } as Event);
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
        return () => unsubscribe();
    }, [id, router]);

    // Load selected seats from sessionStorage
    useEffect(() => {
        if (event?.hasSeating) {
            const storedSeats = sessionStorage.getItem('selectedSeats');
            if (storedSeats) {
                try {
                    const seats: Seat[] = JSON.parse(storedSeats);
                    setSelectedSeats(seats);

                    // Calculate total from seats
                    const total = seats.reduce((sum, seat) => sum + seat.price, 0);
                    setSeatTotalPrice(total);
                    setTicketCount(seats.length);
                } catch (error) {
                    console.error('Error parsing seats:', error);
                }
            }
        }
    }, [event]);

    const handleReservation = async () => {
        if (!user || !event) return;
        if (!phoneNumber || !fullName) {
            alert('Lütfen iletişim bilgilerini eksiksiz giriniz.');
            return;
        }

        const phoneRegex = /^05\d{9}$/;
        if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
            alert('Lütfen geçerli bir telefon numarası giriniz (Başında 05 ile, 11 hane).');
            return;
        }

        setProcessing(true);

        try {
            // 1. ÖNCE KOLTUKLARI SATIŞA ÇEVİR (En Kritik Adım)
            if (event.hasSeating && selectedSeats.length > 0) {
                try {
                    await markSeatsAsSold(
                        event.id,
                        selectedSeats.map(seat => seat.id),
                        user.uid
                    );
                    // Clear sessionStorage immediately after successful lock
                    sessionStorage.removeItem('selectedSeats');
                } catch (seatError) {
                    console.error('Error marking seats as sold:', seatError);
                    alert('Koltuk rezervasyon süreniz dolmuş veya bu koltuklar başkası tarafından alınmış olabilir. Lütfen tekrar seçim yapınız.');
                    setProcessing(false);
                    return; // ABORT TRANSACTION
                }
            }

            const uniqueQrCode = `${user.uid}-${event.id}-${Date.now()}`;

            // Fiyat hesaplama
            let subtotal;
            let basePrice;

            if (event.hasSeating && selectedSeats.length > 0) {
                // Koltuk bazlı fiyatlandırma
                subtotal = seatTotalPrice;
                basePrice = seatTotalPrice / selectedSeats.length;
            } else {
                // Geleneksel bilet fiyatlandırması
                basePrice = event.ticketTypes?.[0]?.price || ticketPrice;
                subtotal = ticketCount * basePrice;
            }

            const discountAmount = appliedDiscount?.discountAmount || 0;
            const totalAmount = subtotal - discountAmount;

            const ticketData: any = {
                eventId: event.id,
                eventTitle: event.title,
                eventDate: event.date,
                eventLocation: event.location,
                eventImage: event.imageUrl,
                ticketCount: event.hasSeating ? selectedSeats.length : ticketCount,
                basePrice: basePrice,
                subtotal: subtotal,
                discountAmount: discountAmount,
                discountCode: appliedDiscountCode || null,
                totalAmount: totalAmount,
                purchaseDate: new Date().toISOString(),
                qrCode: uniqueQrCode,
                status: 'reserved',
                paymentType: 'pay_at_door',
                contactName: fullName,
                contactPhone: phoneNumber
            };

            // Add seat information if applicable
            if (event.hasSeating && selectedSeats.length > 0) {
                ticketData.seats = selectedSeats.map(seat => ({
                    row: seat.row,
                    number: seat.seat,
                    category: seat.category,
                    price: seat.price
                }));
                ticketData.seatNames = selectedSeats.map(seat => formatSeatName(seat)).join(', ');
            }

            const userTicketRef = doc(db, 'users', user.uid);
            await setDoc(userTicketRef, {
                tickets: arrayUnion(ticketData)
            }, { merge: true });

            // Add to Event's reservations subcollection
            await addDoc(collection(db, 'events', event.id, 'reservations'), {
                userUid: user.uid,
                contactName: fullName,
                contactPhone: phoneNumber,
                ticketCount: ticketCount,
                discountCode: appliedDiscountCode || null,
                discountAmount: discountAmount,
                totalAmount: totalAmount,
                purchaseDate: new Date().toISOString(),
                qrCode: uniqueQrCode,
                status: 'valid',
                checkedIn: false
            });

            // İndirim kodu kullanıldıysa, işaretle ve sayacı artır
            if (appliedDiscountCode && appliedDiscount?.valid) {
                try {
                    // Kullanım kaydı ekle
                    await addDoc(collection(db, 'discountCodeUsage'), {
                        codeId: appliedDiscountCode,
                        code: appliedDiscountCode,
                        userId: user.uid,
                        eventId: event.id,
                        discountAmount: discountAmount,
                        usedAt: new Date().toISOString()
                    });
                } catch (codeError) {
                    console.error('Error tracking discount code:', codeError);
                }
            }

            alert(`Rezervasyonunuz alındı! ${discountAmount > 0 ? `${discountAmount}₺ indirim uygulandı. ` : ''}Biletiniz oluşturuldu. Ödemeyi kapıda yapabilirsiniz.`);
            router.push('/biletlerim');
        } catch (error) {
            console.error("Hata:", error);
            alert('Bir hata oluştu.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Yükleniyor...</div>;
    if (!event) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">Etkinlik bulunamadı.</div>;

    return (
        <div className="min-h-screen bg-background text-foreground flex justify-center py-12 px-4 transition-colors duration-300">
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sol: Rezervasyon Formu */}
                <div className="bg-card p-6 rounded-2xl border border-border h-fit">
                    <div className="mb-6 bg-primary/10 border border-primary/20 p-4 rounded-xl">
                        <h2 className="text-primary font-bold flex items-center gap-2">
                            <Ticket size={20} /> Kapıda Ödeme / Rezervasyon
                        </h2>
                        <p className="text-sm text-muted-foreground mt-2">
                            Online ödeme sistemi şu an bakımda. Bilgilerinizi girerek yerinizi ayırtabilir, ödemeyi etkinlik girişinde yapabilirsiniz.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-muted-foreground mb-1">Ad Soyad</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-muted-foreground" size={18} />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Etkinliğe katılacak kişi"
                                    className="w-full bg-muted/50 border border-border rounded-lg p-3 pl-10 text-foreground focus:border-primary outline-none transition-colors"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-muted-foreground mb-1">Telefon Numarası</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-muted-foreground" size={18} />
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="05XX XXX XX XX"
                                    className="w-full bg-muted/50 border border-border rounded-lg p-3 pl-10 text-foreground focus:border-primary outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Sağ: Özet */}
                <div className="space-y-6">
                    <div className="bg-card p-6 rounded-2xl border border-border">
                        <div className="flex gap-4 mb-4">
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                <Image src={event.imageUrl || '/placeholder.jpg'} alt="event" fill className="object-cover" unoptimized />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground line-clamp-2">{event.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg mb-4">
                            <span className="text-muted-foreground">Bilet Adeti</span>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setTicketCount(Math.max(1, ticketCount - 1))} className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-black transition-colors">-</button>
                                <span className="font-bold text-foreground w-4 text-center">{ticketCount}</span>
                                <button onClick={() => setTicketCount(ticketCount + 1)} className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-black transition-colors">+</button>
                            </div>
                        </div>

                        {/* İndirim Kodu Bölümü */}
                        {user && event && (
                            <div className="mb-4">
                                <DiscountCodeInput
                                    userId={user.uid}
                                    eventId={event.id}
                                    eventCategory={event.category || ''}
                                    purchaseAmount={ticketCount * ticketPrice}
                                    onDiscountApplied={(result, code) => {
                                        setAppliedDiscount(result);
                                        setAppliedDiscountCode(code);
                                    }}
                                    onDiscountRemoved={() => {
                                        setAppliedDiscount(null);
                                        setAppliedDiscountCode(null);
                                    }}
                                    disabled={processing}
                                />
                            </div>
                        )}

                        {/* Fiyat Özeti */}
                        <div className="border-t border-border pt-4 space-y-3 mb-6">
                            {/* Ara Toplam */}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Ara Toplam ({ticketCount} bilet)</span>
                                <span className="text-foreground font-medium">{ticketCount * ticketPrice} ₺</span>
                            </div>

                            {/* Grup İndirimi */}
                            {(() => {
                                const groupDiscount = calculateGroupDiscount(ticketPrice, ticketCount, groupTiers);
                                const nextTierInfo = getNextTierInfo(ticketCount, groupTiers);

                                return groupDiscount.appliedTier ? (
                                    <>
                                        <div className="flex justify-between items-center text-sm animate-fadeIn">
                                            <span className="text-blue-500 flex items-center gap-1">
                                                <UsersIcon className="w-4 h-4" />
                                                Grup İndirimi (%{groupDiscount.discountPercentage})
                                            </span>
                                            <span className="text-blue-500 font-medium">-{groupDiscount.discount} ₺</span>
                                        </div>
                                        {nextTierInfo.hasNextTier && (
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-xs text-blue-400">
                                                💡 {nextTierInfo.ticketsNeeded} bilet daha al, %{nextTierInfo.nextTier!.discount * 100} indirim kazan!
                                            </div>
                                        )}
                                    </>
                                ) : null;
                            })()}

                            {/* İndirim Kodu */}
                            {appliedDiscount?.valid && appliedDiscount.discountAmount && appliedDiscount.discountAmount > 0 && (
                                <div className="flex justify-between items-center text-sm animate-fadeIn">
                                    <span className="text-green-500 flex items-center gap-1">
                                        <TrendingDown className="w-4 h-4" />
                                        İndirim Kodu ({appliedDiscountCode})
                                    </span>
                                    <span className="text-green-500 font-medium">-{appliedDiscount.discountAmount} ₺</span>
                                </div>
                            )}

                            {/* Toplam */}
                            <div className="border-t border-border pt-3 flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-muted-foreground">Kapıda Ödenecek</span>
                                    <span className="text-xs text-muted-foreground">(Nakit veya Kredi Kartı)</span>
                                </div>
                                <span className="text-2xl font-bold text-primary">
                                    {(() => {
                                        const groupDiscount = calculateGroupDiscount(ticketPrice, ticketCount, groupTiers);
                                        let total = groupDiscount.finalPrice;

                                        // İndirim kodu varsa uygula
                                        if (appliedDiscount?.finalPrice !== undefined) {
                                            total = appliedDiscount.finalPrice;
                                        }

                                        return Math.round(total);
                                    })()} ₺
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleReservation}
                            disabled={processing}
                            className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl transition-all disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {processing ? 'İşleniyor...' : 'Rezervasyon Oluştur'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
