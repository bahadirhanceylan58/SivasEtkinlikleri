"use client";

import { useState, useEffect } from "react";
import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CalendarPlus, Upload, CheckCircle, AlertCircle, Banknote, Users, Image as ImageIcon } from "lucide-react";

export default function CreateEventPage() {
    const { user, isAdmin } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [ticketType, setTicketType] = useState<"free" | "paid">("free");

    const searchParams = useSearchParams();
    const editId = searchParams.get('id');
    const clubId = searchParams.get('clubId');
    const clubName = searchParams.get('clubName');

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        price: "0",
        quota: "100",
        category: "Konser",
        imageUrl: "", // Store existing image URL
    });

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    // Fetch data for editing
    useEffect(() => {
        const fetchEvent = async () => {
            if (!editId || !user) return;

            try {
                setLoading(true);
                const docRef = doc(db, "events", editId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Security Check
                    if (data.ownerId !== user.uid && !isAdmin) {
                        alert("Bu etkinliği düzenleme yetkiniz yok.");
                        router.push("/");
                        return;
                    }

                    setFormData({
                        title: data.title || "",
                        description: data.description || "",
                        date: data.date || "",
                        time: data.time || "",
                        location: data.location || "",
                        price: data.price?.toString() || "0",
                        quota: data.quota?.toString() || "100",
                        category: data.category || "Konser",
                        imageUrl: data.imageUrl || "",
                    });
                    setPreviewUrl(data.imageUrl);
                    if (data.price && data.price !== "0") setTicketType("paid");
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [editId, user, isAdmin, router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Dosya boyutu kontrolü
            if (file.size > MAX_FILE_SIZE) {
                alert("Dosya boyutu çok büyük! Maksimum 5MB yükleyebilirsiniz.");
                e.target.value = '';
                return;
            }

            // Dosya türü kontrolü
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                alert("Sadece JPEG, PNG ve WebP formatları kabul edilmektedir.");
                e.target.value = '';
                return;
            }

            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            router.push("/login");
            return;
        }

        if (!imageFile && !formData.imageUrl) {
            alert("Lütfen bir afiş görseli yükleyin.");
            return;
        }

        setLoading(true);

        try {
            let downloadURL = formData.imageUrl;

            // 1. Yeni resim varsa yükle
            if (imageFile) {
                const storageRef = ref(storage, `events/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                downloadURL = await getDownloadURL(snapshot.ref);
            }

            // 2. Etkinliği Kaydet veya Güncelle
            const finalPrice = ticketType === "free" ? "0" : formData.price;

            const eventData = {
                title: formData.title,
                description: formData.description,
                date: formData.date,
                time: formData.time,
                location: formData.location,
                category: formData.category,
                price: finalPrice,
                quota: formData.quota,
                imageUrl: downloadURL,
                updatedAt: serverTimestamp(),
            };

            if (editId) {
                // Update
                await updateDoc(doc(db, "events", editId), eventData);
            } else {
                // Create
                await addDoc(collection(db, "events"), {
                    ...eventData,
                    ownerId: user.uid,
                    ownerName: user.displayName || user.email?.split('@')[0],
                    status: isAdmin ? "approved" : "pending",
                    createdAt: serverTimestamp(),
                    clubId: clubId || null
                });
            }

            setSuccess(true);
        } catch (error) {
            console.error("Hata:", error);
            alert("Bir hata oluştu: " + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 pt-32 text-center animate-fadeIn">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-glow">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Etkinlik Gönderildi! 🚀</h1>
                    <p className="text-gray-400 max-w-md mb-8">
                        Etkinliğiniz başarıyla oluşturuldu ve onaya gönderildi. Yönetici onayından sonra yayına girecektir.
                    </p>
                    <button onClick={() => router.push("/")} className="px-8 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90">
                        Ana Sayfaya Dön
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            <div className="container mx-auto px-4 py-12 pt-24 flex-1">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <CalendarPlus className="w-8 h-8 text-primary" />
                            Etkinlik Oluştur
                        </h1>
                        <p className="text-gray-400">Etkinlik detaylarını girerek topluluğuna ulaş.</p>
                    </div>

                    {clubName && (
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center gap-3 mb-8">
                            <Users className="w-6 h-6 text-blue-500" />
                            <div>
                                <p className="font-bold text-blue-400">Kulüp Etkinliği</p>
                                <p className="text-sm text-gray-400">
                                    Bu etkinlik <span className="text-white font-semibold">{clubName}</span> adına oluşturuluyor.
                                </p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* 1. Temel Bilgiler */}
                        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/10">
                            <h3 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-2">Genel Bilgiler</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Etkinlik Başlığı</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:border-primary focus:outline-none placeholder-zinc-500"
                                        placeholder="Örn: Büyük Yaz Konseri"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Tarih</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:border-primary focus:outline-none [color-scheme:dark]"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Saat</label>
                                        <input
                                            type="time"
                                            required
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:border-primary focus:outline-none [color-scheme:dark]"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Mekan / Konum</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:border-primary focus:outline-none placeholder-zinc-500"
                                            placeholder="Örn: Atatürk Kültür Merkezi"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Kategori</label>
                                        <select
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:border-primary focus:outline-none"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="Konser">Konser</option>
                                            <option value="Tiyatro">Tiyatro</option>
                                            <option value="Sinema">Sinema</option>
                                            <option value="Workshop">Workshop</option>
                                            <option value="Spor">Spor</option>
                                            <option value="Gezi">Gezi</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Bilet ve Ücret */}
                        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/10">
                            <h3 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-2 flex items-center gap-2">
                                <Banknote className="w-5 h-5 text-green-500" /> Bilet Bilgileri
                            </h3>

                            <div className="mb-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setTicketType("free")}
                                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${ticketType === "free" ? "bg-green-600 text-white shadow-lg" : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"}`}
                                >
                                    Ücretsiz (Rezervasyon)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTicketType("paid")}
                                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${ticketType === "paid" ? "bg-primary text-black shadow-lg" : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"}`}
                                >
                                    Ücretli Bilet
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {ticketType === "paid" && (
                                    <div className="animate-fadeIn">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Bilet Fiyatı (₺)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:border-primary focus:outline-none"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <Users className="w-4 h-4" /> Kontenjan (Kişi Sayısı)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:border-primary focus:outline-none"
                                        placeholder="Örn: 100"
                                        value={formData.quota}
                                        onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Görsel ve Açıklama */}
                        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/10">
                            <h3 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-2 flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-blue-400" /> Görsel & Detay
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Afiş Görseli Yükle</label>

                                    <div className="relative group cursor-pointer">
                                        <div className={`w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${imageFile ? 'border-primary bg-primary/10' : 'border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-500'}`}>
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded-xl" />
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-white transition-colors" />
                                                    <span className="text-gray-400 group-hover:text-white transition-colors">Resim seçmek için tıklayın</span>
                                                    <span className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG (Max 5MB)</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                required
                                                onChange={handleImageChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    {imageFile && (
                                        <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" /> {imageFile.name} seçildi
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Etkinlik Açıklaması</label>
                                    <textarea
                                        required
                                        rows={5}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:border-primary focus:outline-none resize-none placeholder-zinc-500"
                                        placeholder="Etkinlik hakkında detaylı bilgi verin..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-200">
                                Oluşturduğunuz etkinlik yönetici onayına düşecektir. Onaylanana kadar ana sayfada görünmez.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-black font-bold text-xl rounded-xl hover:bg-primary/90 transition-all shadow-glow hover:scale-[1.01] disabled:opacity-50"
                        >
                            {loading ? "Yükleniyor..." : "Etkinliği Yayınla"}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}
