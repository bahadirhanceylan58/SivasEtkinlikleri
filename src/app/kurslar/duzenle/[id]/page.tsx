"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Save, ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";

export default function EditUserCoursePage({ params }: { params: { id: string } }) {
    const { user, isAdmin } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        instructor: "",
        date: "",
        price: "",
        quota: "",
        imageUrl: ""
    });

    // Veriyi Çekme ve Yetki Kontrolü
    useEffect(() => {
        async function fetchCourse() {
            // Kullanıcı oturumu yüklenene kadar bekle
            if (user === undefined) return;
            if (!user) {
                router.push("/login");
                return;
            }

            try {
                const docRef = doc(db, "courses", params.id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();

                    // --- GÜVENLİK KONTROLÜ ---
                    // Sadece kursun sahibi veya Admin düzenleyebilir
                    if (data.ownerId !== user.uid && !isAdmin) {
                        alert("Bu kursu düzenleme yetkiniz yok! Sadece kendi kurslarınızı düzenleyebilirsiniz.");
                        router.push("/panel");
                        return;
                    }

                    setFormData({
                        title: data.title || "",
                        description: data.description || "",
                        instructor: data.instructor || "",
                        date: data.date || "",
                        price: data.price || "",
                        quota: data.quota || "",
                        imageUrl: data.imageUrl || ""
                    });
                } else {
                    alert("Kurs bulunamadı.");
                    router.push("/panel");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchCourse();
    }, [user, params.id, router]);

    // Güncelleme İşlemi
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateDoc(doc(db, "courses", params.id), formData);
            alert("Kurs başarıyla güncellendi! ✅");
            router.push("/panel"); // İşlem bitince panele dön
        } catch (error) {
            console.error(error);
            alert("Güncellerken bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="animate-spin w-10 h-10 text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            <div className="container mx-auto px-4 py-12 flex-1">
                <div className="max-w-3xl mx-auto">
                    {/* Geri Dön Butonu */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-400 mb-6 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} /> İptal ve Geri Dön
                    </button>

                    <h1 className="text-3xl font-bold mb-2">Kursu Düzenle</h1>
                    <p className="text-gray-400 mb-8">Kurs bilgilerini güncelleyin ve kaydedin.</p>

                    <form onSubmit={handleUpdate} className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 space-y-6">

                        {/* Başlık */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Kurs Adı</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white focus:border-primary focus:outline-none"
                            />
                        </div>

                        {/* Eğitmen ve Tarih */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Eğitmen Adı</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.instructor}
                                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white focus:border-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Başlangıç Tarihi</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        {/* Açıklama */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Açıklama</label>
                            <textarea
                                rows={5}
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white focus:border-primary focus:outline-none resize-none"
                            />
                        </div>

                        {/* Fiyat ve Kota */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Fiyat (₺)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white focus:border-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Kontenjan</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.quota}
                                    onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white focus:border-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Resim Linki */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Görsel URL</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 p-4 pl-12 rounded-xl text-white focus:border-primary focus:outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <button
                            disabled={saving}
                            type="submit"
                            className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:bg-primary/90 mt-4 flex justify-center gap-2 items-center transition-all hover:scale-[1.01]"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}
