"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Upload, CheckCircle } from "lucide-react";

export default function CreateClubPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "Sanat",
        phone: "",
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert("Kulüp oluşturmak için önce giriş yapmalısınız!");
            router.push("/login");
            return;
        }

        setLoading(true);

        try {
            let downloadURL = "";
            if (logoFile) {
                const storageRef = ref(storage, `clubs/${Date.now()}_${logoFile.name}`);
                const snapshot = await uploadBytes(storageRef, logoFile);
                downloadURL = await getDownloadURL(snapshot.ref);
            }

            await addDoc(collection(db, "clubs"), {
                ...formData,
                logoUrl: downloadURL,
                ownerId: user.uid,
                ownerName: user.name || user.email?.split('@')[0],
                status: "pending",
                createdAt: serverTimestamp(),
                membersCount: 1,
            });
            setSuccess(true);
        } catch (error) {
            console.error("Hata:", error);
            alert("Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center pt-24">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Başvurunuz Alındı! 🎉</h1>
                    <p className="text-gray-400 max-w-md mb-8">
                        Kulüp oluşturma isteğiniz yöneticilerimize iletildi. İncelendikten sonra onaylanırsa size bildirim gelecektir.
                    </p>
                    <button
                        onClick={() => router.push("/")}
                        className="px-8 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-all"
                    >
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
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4 text-primary">
                            <Users className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-3">Kulübünü Kur, Topluluğunu Büyüt</h1>
                        <p className="text-gray-400">Sivas'taki etkinlik severleri bir araya getirmek için kendi kulübünü oluştur.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-6 md:p-8 rounded-3xl border border-white/10">

                        {/* Kulüp Adı */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Kulüp Adı</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                                placeholder="Örn: Sivas Gezi Kulübü"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Kategori */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Kategori</label>
                            <select
                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="Sanat">Sanat & Kültür</option>
                                <option value="Spor">Spor</option>
                                <option value="Teknoloji">Teknoloji & Yazılım</option>
                                <option value="Gezi">Gezi & Kamp</option>
                                <option value="Müzik">Müzik</option>
                                <option value="Eğlence">Eğlence</option>
                            </select>
                        </div>

                        {/* Açıklama */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Kulüp Hakkında</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none resize-none"
                                placeholder="Kulübünüz ne yapıyor? Amacınız ne?"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* İletişim */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">İletişim Numarası / WhatsApp</label>
                            <input
                                type="tel"
                                required
                                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none"
                                placeholder="05XX XXX XX XX"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Kulüp Logosu (Opsiyonel)</label>
                            <div className="relative group cursor-pointer">
                                <div className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${logoFile ? 'border-primary bg-primary/10' : 'border-white/10 bg-black/50 hover:bg-black/70 hover:border-white/30'}`}>
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded-xl" />
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-white transition-colors" />
                                            <span className="text-gray-400 group-hover:text-white transition-colors">Logo seçmek için tıklayın</span>
                                            <span className="text-xs text-gray-500 mt-1">PNG, JPG (Max 5MB)</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                            {logoFile && (
                                <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" /> {logoFile.name} seçildi
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary text-black font-bold text-lg rounded-xl hover:bg-primary/90 transition-all shadow-glow hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Gönderiliyor..." : "Başvuruyu Tamamla"}
                        </button>

                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}
