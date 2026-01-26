'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, addDoc, collection } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Image from 'next/image';
import { Phone, User, Ticket } from 'lucide-react';

export default function PaymentPage() {
    const { id } = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [fullName, setFullName] = useState('');

    const [ticketCount, setTicketCount] = useState(1);
    const ticketPrice = 150;

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
                    setEvent({ id: docSnap.id, ...docSnap.data() });
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

    const handleReservation = async () => {
        if (!user || !event) return;
        if (!phoneNumber || !fullName) {
            alert('Lütfen iletişim bilgilerini eksiksiz giriniz.');
            return;
        }
        setProcessing(true);

        setTimeout(async () => {
            try {
                const uniqueQrCode = `${user.uid}-${event.id}-${Date.now()}`;

                const ticketData = {
                    eventId: event.id,
                    eventTitle: event.title,
                    eventDate: event.date,
                    eventLocation: event.location,
                    eventImage: event.imageUrl,
                    ticketCount: ticketCount,
                    totalAmount: ticketCount * ticketPrice,
                    purchaseDate: new Date().toISOString(),
                    qrCode: uniqueQrCode,
                    status: 'reserved', // Statü: Rezerve Edildi
                    paymentType: 'pay_at_door', // Ödeme Tipi: Kapıda
                    contactName: fullName,
                    contactPhone: phoneNumber
                };
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
                    purchaseDate: new Date().toISOString()
                });
                alert('Rezervasyonunuz alındı! Biletiniz oluşturuldu. Ödemeyi kapıda yapabilirsiniz.');
                router.push('/biletlerim');
            } catch (error) {
                console.error("Hata:", error);
                alert('Bir hata oluştu.');
            } finally {
                setProcessing(false);
            }
        }, 1500);
    };

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Yükleniyor...</div>;
    if (!event) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Etkinlik bulunamadı.</div>;

    return (
        <div className="min-h-screen bg-black text-white flex justify-center py-12 px-4">
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sol: Rezervasyon Formu */}
                <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 h-fit">
                    <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
                        <h2 className="text-yellow-500 font-bold flex items-center gap-2">
                            <Ticket size={20} /> Kapıda Ödeme / Rezervasyon
                        </h2>
                        <p className="text-sm text-gray-400 mt-2">
                            Online ödeme sistemi şu an bakımda. Bilgilerinizi girerek yerinizi ayırtabilir, ödemeyi etkinlik girişinde yapabilirsiniz.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Ad Soyad</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Etkinliğe katılacak kişi"
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 pl-10 text-white focus:border-yellow-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Telefon Numarası</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-gray-500" size={18} />
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="05XX XXX XX XX"
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 pl-10 text-white focus:border-yellow-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Sağ: Özet */}
                <div className="space-y-6">
                    <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
                        <div className="flex gap-4 mb-4">
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                <Image src={event.imageUrl || '/placeholder.jpg'} alt="event" fill className="object-cover" unoptimized />
                            </div>
                            <div>
                                <h3 className="font-bold text-white line-clamp-2">{event.title}</h3>
                                <p className="text-sm text-gray-400 mt-1">{event.location}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-neutral-800 p-3 rounded-lg mb-4">
                            <span className="text-gray-300">Bilet Adeti</span>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setTicketCount(Math.max(1, ticketCount - 1))} className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-colors">-</button>
                                <span className="font-bold text-white w-4 text-center">{ticketCount}</span>
                                <button onClick={() => setTicketCount(ticketCount + 1)} className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-colors">+</button>
                            </div>
                        </div>
                        <div className="border-t border-neutral-700 pt-4 flex justify-between items-center mb-6">
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-gray-400">Kapıda Ödenecek</span>
                                <span className="text-xs text-gray-500">(Nakit veya Kredi Kartı)</span>
                            </div>
                            <span className="text-2xl font-bold text-yellow-500">{ticketCount * ticketPrice} ₺</span>
                        </div>
                        <button
                            onClick={handleReservation}
                            disabled={processing}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl transition-all disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {processing ? 'İşleniyor...' : 'Rezervasyon Oluştur'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
