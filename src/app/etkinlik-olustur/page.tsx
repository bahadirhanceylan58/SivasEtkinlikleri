"use client";

import { useState, useEffect } from "react";
import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CalendarPlus, Upload, CheckCircle, AlertCircle, Banknote, Users, Image as ImageIcon, Plus, Trash2, Ticket } from "lucide-react";

export default function CreateEventPage() {
    const { user, isAdmin } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [salesType, setSalesType] = useState<'internal' | 'external' | 'free'>('internal');
    const [ticketTypes, setTicketTypes] = useState<{ name: string; price: number; quota: number }[]>([
        { name: 'Genel Giriş', price: 0, quota: 100 }
    ]);
    const [externalUrl, setExternalUrl] = useState('');
    const [platformName, setPlatformName] = useState('');

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
                    if (data.salesType) {
                        setSalesType(data.salesType);
                        setTicketTypes(data.ticketTypes || []);
                        setExternalUrl(data.externalUrl || '');
                        setPlatformName(data.platformName || '');
                    } else {
                        // Legacy support
                        if (data.price && data.price !== "0") {
                            setSalesType("internal");
                            setTicketTypes([{ name: "Genel Giriş", price: Number(data.price), quota: Number(data.quota) }]);
                        } else {
                            setSalesType("free");
                        }
                    }
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
            // Calculate starting price for display purposes (lowest price)
            let displayPrice = "0";
            if (salesType === 'internal' && ticketTypes.length > 0) {
                const prices = ticketTypes.map(t => Number(t.price));
                displayPrice = Math.min(...prices).toString();
            } else if (salesType === 'free') {
                displayPrice = "0";
            }

            const eventData = {
                title: formData.title,
                description: formData.description,
                date: formData.date,
                time: formData.time,
                location: formData.location,
                category: formData.category,
                price: displayPrice,
                // quota: formData.quota, // Legacy field, kept for compatibility if needed, but ticketTypes has detailed quota
                imageUrl: downloadURL,
                updatedAt: serverTimestamp(),

                // Advanced Ticket Data
                salesType,
                ticketTypes: salesType === 'internal' ? ticketTypes : [],
                externalUrl: salesType === 'external' ? externalUrl : null,
                platformName: salesType === 'external' ? platformName : null,
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

                            {/* Ticket Type Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <button
                                    type="button"
                                    onClick={() => setSalesType('internal')}
                                    className={`p-4 rounded-xl border-2 transition-all text-left group ${salesType === 'internal'
                                        ? 'border-primary bg-primary/10'
                                        : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <Ticket className={`w-6 h-6 ${salesType === 'internal' ? 'text-primary' : 'text-gray-400'}`} />
                                        {salesType === 'internal' && <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(255,215,0,0.5)]"></div>}
                                    </div>
                                    <div className={`font-bold ${salesType === 'internal' ? 'text-white' : 'text-gray-300'}`}>Site İçi Satış</div>
                                    <div className="text-xs text-gray-500 mt-1">Biletler doğrudan bu site üzerinden satılsın.</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSalesType('external')}
                                    className={`p-4 rounded-xl border-2 transition-all text-left group ${salesType === 'external'
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px]">🔗</div>
                                        </div>
                                        {salesType === 'external' && <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>}
                                    </div>
                                    <div className={`font-bold ${salesType === 'external' ? 'text-white' : 'text-gray-300'}`}>Dış Bağlantı</div>
                                    <div className="text-xs text-gray-500 mt-1">Biletix, Passo, Bubilet vb. yönlendirme linki.</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSalesType('free');
                                        // Reset ticket categories to a single free quota if switching to free
                                        if (salesType !== 'free') {
                                            setTicketTypes([{ name: 'Ücretsiz Giriş', price: 0, quota: 100 }]);
                                        }
                                    }}
                                    className={`p-4 rounded-xl border-2 transition-all text-left group ${salesType === 'free'
                                        ? 'border-green-500 bg-green-500/10'
                                        : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold text-green-500">₺</div>
                                        {salesType === 'free' && <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>}
                                    </div>
                                    <div className={`font-bold ${salesType === 'free' ? 'text-white' : 'text-gray-300'}`}>Ücretsiz / Rezervasyon</div>
                                    <div className="text-xs text-gray-500 mt-1">Katılım ücretsizdir veya sadece rezervasyon gerekir.</div>
                                </button>
                            </div>

                            {/* Internal Sales Content */}
                            {salesType === 'internal' && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium text-gray-300">Bilet Kategorileri</label>
                                        <button
                                            type="button"
                                            onClick={() => setTicketTypes([...ticketTypes, { name: '', price: 0, quota: 100 }])}
                                            className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Kategori Ekle
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {ticketTypes.map((ticket, index) => (
                                            <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-zinc-800/30 p-3 rounded-xl border border-zinc-800">
                                                <div className="flex-1 w-full">
                                                    <span className="text-xs text-gray-500 mb-1 block md:hidden">Kategori Adı</span>
                                                    <input
                                                        type="text"
                                                        placeholder="Kategori Adı (Örn: Tam, Öğrenci)"
                                                        value={ticket.name}
                                                        onChange={(e) => {
                                                            const newTickets = [...ticketTypes];
                                                            newTickets[index].name = e.target.value;
                                                            setTicketTypes(newTickets);
                                                        }}
                                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                                                        required
                                                    />
                                                </div>
                                                <div className="w-full md:w-32">
                                                    <span className="text-xs text-gray-500 mb-1 block md:hidden">Fiyat (₺)</span>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            placeholder="Fiyat"
                                                            value={ticket.price}
                                                            onChange={(e) => {
                                                                const newTickets = [...ticketTypes];
                                                                newTickets[index].price = Number(e.target.value);
                                                                setTicketTypes(newTickets);
                                                            }}
                                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-3 pr-8 py-2 text-white text-sm focus:outline-none focus:border-primary"
                                                            required
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₺</span>
                                                    </div>
                                                </div>
                                                <div className="w-full md:w-32">
                                                    <span className="text-xs text-gray-500 mb-1 block md:hidden">Kontenjan</span>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            placeholder="Adet"
                                                            value={ticket.quota}
                                                            onChange={(e) => {
                                                                const newTickets = [...ticketTypes];
                                                                newTickets[index].quota = Number(e.target.value);
                                                                setTicketTypes(newTickets);
                                                            }}
                                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                {ticketTypes.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newTickets = ticketTypes.filter((_, i) => i !== index);
                                                            setTicketTypes(newTickets);
                                                        }}
                                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors self-end md:self-auto"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* External Sales Content */}
                            {salesType === 'external' && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Bilet Satış Linki</label>
                                        <input
                                            type="url"
                                            placeholder="https://www.biletix.com/etkinlik/..."
                                            value={externalUrl}
                                            onChange={(e) => setExternalUrl(e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:border-primary focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Platform Adı</label>
                                        <input
                                            type="text"
                                            placeholder="Örn: Biletix, Passo, Bubilet"
                                            value={platformName}
                                            onChange={(e) => setPlatformName(e.target.value)}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:border-primary focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Free / Reservation Content */}
                            {salesType === 'free' && (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                                        <p className="text-sm text-green-400 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            Bu etkinlik katılımcılar için tamamen ücretsiz olacaktır.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Toplam Kontenjan</label>
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="Örn: 100"
                                            value={ticketTypes[0]?.quota || 100}
                                            onChange={(e) => {
                                                const newTickets = [...ticketTypes];
                                                if (!newTickets[0]) newTickets[0] = { name: 'Ücretsiz Giriş', price: 0, quota: 100 };
                                                newTickets[0].quota = Number(e.target.value);
                                                setTicketTypes(newTickets);
                                            }}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:border-primary focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            )}
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
