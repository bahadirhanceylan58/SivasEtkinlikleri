"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, MapPin, Share2, ArrowLeft, Clock, Info, Star, X, Map as MapIcon, Phone, Facebook, Instagram as InstagramIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dynamic from 'next/dynamic';
import ReviewCard, { Review } from "@/components/ReviewCard";
import RatingStars from "@/components/RatingStars";

// MapViewer'ı client-side only olarak import et (SSR hatasını önlemek için)
const MapViewer = dynamic(() => import('@/components/MapViewer'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-xl" />
});

interface EventDetail {
    id: string;
    title: string;
    description: string;
    date: string;
    time?: string;
    location: string;
    coordinates?: { lat: number; lng: number }; // Harita için koordinat
    imageUrl: string;
    price?: string;
    category: string;
    organizer?: string;
    hasSeating?: boolean;
    ticketUrl?: string;
}

export default function EventDetailClient() {
    const params = useParams();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isImageOpen, setIsImageOpen] = useState(false);

    // Auth & Review State
    const [user, setUser] = useState<any>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        async function fetchEventAndReviews() {
            if (!params.id) return;

            try {
                // 1. Etkinliği Çek
                const docRef = doc(db, "events", params.id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setEvent({ id: docSnap.id, ...docSnap.data() } as EventDetail);

                    // 2. Yorumları Çek
                    const reviewsRef = collection(db, "reviews");
                    // Not: orderBy index hatası verdiği için client-side sıralıyoruz
                    const q = query(
                        reviewsRef,
                        where("eventId", "==", params.id)
                    );

                    const querySnapshot = await getDocs(q);
                    const fetchedReviews = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as Review[];

                    // Client-side sort
                    fetchedReviews.sort((a, b) => {
                        const aTime = a.createdAt?.seconds || 0;
                        const bTime = b.createdAt?.seconds || 0;
                        return bTime - aTime;
                    });

                    setReviews(fetchedReviews);

                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Veri çekilirken hata:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchEventAndReviews();
    }, [params.id]);

    const handleSubmitReview = async () => {
        if (!user) {
            alert("Yorum yapmak için giriş yapmalısınız.");
            return;
        }
        if (userRating === 0) {
            alert("Lütfen bir puan verin.");
            return;
        }
        if (!userComment.trim()) {
            alert("Lütfen bir yorum yazın.");
            return;
        }

        setSubmittingReview(true);
        try {
            const newReview = {
                eventId: event?.id,
                userId: user.uid,
                userName: user.displayName || user.email?.split('@')[0] || "Kullanıcı",
                userAvatar: user.photoURL,
                rating: userRating,
                comment: userComment,
                createdAt: serverTimestamp(),
                likes: 0,
                likedBy: [],
                isEdited: false
            };

            const docRef = await addDoc(collection(db, "reviews"), newReview);

            // Optimistic update
            const createdReview = {
                ...newReview,
                id: docRef.id,
                createdAt: new Date() // Timestamp yerine Date objesi (gösterim için)
            } as unknown as Review;

            setReviews([createdReview, ...reviews]);
            setUserRating(0);
            setUserComment("");
            alert("Değerlendirmeniz alındı!");
        } catch (error) {
            console.error("Yorum gönderilirken hata:", error);
            alert("Bir hata oluştu.");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
    if (error || !event) return <div className="min-h-screen flex items-center justify-center text-2xl font-bold">Etkinlik bulunamadı.</div>;

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />

            {/* --- RESİM BÜYÜTME MODALI --- */}
            {isImageOpen && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onClick={() => setIsImageOpen(false)}>
                    <button className="absolute top-4 right-4 text-white hover:text-primary transition-colors">
                        <X className="w-10 h-10" />
                    </button>
                    <div className="relative w-full max-w-4xl h-[80vh]">
                        <Image src={event.imageUrl} alt={event.title} fill className="object-contain" />
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 py-8 flex-1">

                <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Geri Dön
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* --- SOL KOLON --- */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Afiş */}
                        <div
                            className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl group cursor-zoom-in border border-border"
                            onClick={() => setIsImageOpen(true)}
                        >
                            <Image
                                src={event.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"}
                                alt={event.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium transition-all transform translate-y-4 group-hover:translate-y-0">
                                    Büyütmek için tıkla
                                </span>
                            </div>
                        </div>

                        {/* Bilet Kartı */}
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-lg sticky top-24">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <span className="text-sm text-muted-foreground block mb-1">Bilet Fiyatı</span>
                                    <span className="text-3xl font-bold text-primary">
                                        {event.price === "0" || !event.price ? "Ücretsiz" : `${event.price} ₺`}
                                    </span>
                                </div>
                            </div>

                            {event.ticketUrl ? (
                                <a
                                    href={event.ticketUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full"
                                >
                                    <button className="w-full py-3.5 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-glow mb-4">
                                        Bilet Satış Sitesine Git
                                    </button>
                                </a>
                            ) : (
                                <Link
                                    href={event.hasSeating ? `/etkinlik/${event.id}/koltuk-sec` : `/odeme/${event.id}`}
                                    className="block w-full"
                                >
                                    <button className="w-full py-3.5 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 hover:scale-[1.02] transition-all shadow-glow mb-4">
                                        {event.hasSeating ? 'Koltuk Seç / Bilet Al' : 'Bilet Al / Rezervasyon'}
                                    </button>
                                </Link>
                            )}

                            <div className="text-xs text-muted-foreground text-center mb-4">
                                Güvenli ödeme ve anında bilet teslimi.
                            </div>

                            <div className="border-t border-border pt-4">
                                <p className="text-xs text-muted-foreground font-medium mb-3 text-center">Etkinliği Paylaş</p>
                                <div className="flex gap-2 justify-center">
                                    <button
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: event.title,
                                                    text: `${event.title} - Sivas Etkinlikleri`,
                                                    url: window.location.href,
                                                }).catch(console.error);
                                            } else {
                                                navigator.clipboard.writeText(window.location.href);
                                                alert("Bağlantı kopyalandı!");
                                            }
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 text-sm bg-muted/50 hover:bg-muted text-foreground py-2.5 rounded-xl transition-all active:scale-95"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        <span>Genel</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            const text = encodeURIComponent(`${event.title} etkinliğini kaçırma!`);
                                            const url = encodeURIComponent(window.location.href);
                                            window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
                                        }}
                                        className="w-10 h-10 flex items-center justify-center bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-xl transition-all active:scale-95"
                                        title="WhatsApp'ta Paylaş"
                                    >
                                        <Phone className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => {
                                            const text = encodeURIComponent(`${event.title} etkinliğini inceliyorum! @SivasEtkinlik`);
                                            const url = encodeURIComponent(window.location.href);
                                            window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
                                        }}
                                        className="w-10 h-10 flex items-center justify-center bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-xl transition-all active:scale-95"
                                        title="Twitter'da Paylaş"
                                    >
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                                    </button>

                                    <button
                                        onClick={() => {
                                            const url = encodeURIComponent(window.location.href);
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                                        }}
                                        className="w-10 h-10 flex items-center justify-center bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 rounded-xl transition-all active:scale-95"
                                        title="Facebook'ta Paylaş"
                                    >
                                        <Facebook className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            alert("Bağlantı kopyalandı! Instagram'da hikaye veya gönderi olarak paylaşabilirsiniz.");
                                        }}
                                        className="w-10 h-10 flex items-center justify-center bg-pink-600/10 text-pink-600 hover:bg-pink-600/20 rounded-xl transition-all active:scale-95"
                                        title="Instagram'da Paylaş"
                                    >
                                        <InstagramIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- SAĞ KOLON --- */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* ... Mevcut Header ve Detay Kısımları Aynı ... */}
                        <div>
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wide">
                                    {event.category}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-foreground">{event.title}</h1>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-xl border border-border/50">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Tarih</p>
                                        <p className="font-medium">
                                            {new Date(event.date).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                {event.time && (
                                    <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-xl border border-border/50">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Saat</p>
                                            <p className="font-medium">{event.time}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-xl border border-border/50 md:col-span-2">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Konum</p>
                                        <p className="font-medium">{event.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                                <Info size={20} className="text-primary" /> Etkinlik Detayları
                            </h3>
                            <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-lg">
                                {event.description}
                            </p>
                        </div>

                        <hr className="border-border" />

                        {/* Gelişmiş Harita ve Mekan */}
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <MapIcon size={20} className="text-primary" /> Mekan ve Harita
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 bg-muted/20 rounded-xl">
                                    <div className="bg-primary/10 p-3 rounded-full text-primary mt-1">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">{event.location}</p>
                                        <p className="text-muted-foreground text-sm">Sivas, Türkiye</p>
                                    </div>
                                </div>

                                {/* Harita */}
                                <div className="h-[300px] w-full rounded-xl overflow-hidden border border-border z-0 relative">
                                    {event.coordinates ? (
                                        <MapViewer position={[event.coordinates.lat, event.coordinates.lng]} title={event.location} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-muted/30 text-muted-foreground gap-2">
                                            <MapPin size={32} className="opacity-50" />
                                            <span>Harita konumu bulunamadı</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Organizatör */}
                        {event.organizer && (
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Info size={20} className="text-primary" /> Organizatör
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                        {event.organizer.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">{event.organizer}</p>
                                        <p className="text-sm text-muted-foreground">Onaylanmış Organizatör</p>
                                    </div>
                                    <button className="ml-auto px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                                        Profili Gör
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Değerlendirmeler */}
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Star size={20} className="text-primary" /> Değerlendirmeler
                                </h3>
                                <span className="text-2xl font-bold text-primary flex items-center gap-2">
                                    {averageRating} <span className="text-sm text-muted-foreground font-normal">/ 5</span>
                                </span>
                            </div>

                            {/* Yorum Yapma Formu */}
                            <div className="mb-8 bg-muted/20 p-5 rounded-xl border border-border">
                                <h4 className="font-semibold mb-3">Puan Ver & Yorum Yap</h4>
                                {user ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-muted-foreground mb-1 block">Puanınız</label>
                                            <RatingStars
                                                rating={userRating}
                                                maxRating={5}
                                                size="lg"
                                                interactive={true}
                                                onRatingChange={setUserRating}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground mb-1 block">Yorumunuz</label>
                                            <textarea
                                                value={userComment}
                                                onChange={(e) => setUserComment(e.target.value)}
                                                placeholder="Bu etkinlik hakkında düşüncelerinizi paylaşın..."
                                                className="w-full bg-background border border-border rounded-lg p-3 min-h-[100px] outline-none focus:border-primary transition-all text-sm"
                                            ></textarea>
                                        </div>
                                        <button
                                            onClick={handleSubmitReview}
                                            disabled={submittingReview}
                                            className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 text-sm"
                                        >
                                            {submittingReview ? "Gönderiliyor..." : "Yorumu Gönder"}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-muted-foreground mb-3">Yorum yapabilmek için giriş yapmalısınız.</p>
                                        <Link href="/login" className="px-4 py-2 border border-border bg-background rounded-lg hover:bg-muted transition-colors text-sm font-medium">
                                            Giriş Yap
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Yorum Listesi */}
                            <div className="space-y-4">
                                {reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <ReviewCard key={review.id} review={review} currentUserId={user?.uid} />
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Henüz değerlendirme yapılmamış. İlk yorumu sen yap!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
