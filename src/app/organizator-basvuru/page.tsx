"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText, Send, CheckCircle, AlertCircle, Info, ShieldCheck, Zap, BarChart3 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function OrganizerApplicationPage() {
    const { user, role } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        fullName: user?.displayName || "",
        email: user?.email || "",
        phone: "",
        organizationName: "",
        description: "",
        experience: "new" // new, intermediate, professional
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            await addDoc(collection(db, "organizer_applications"), {
                userId: user.uid,
                ...formData,
                status: "pending",
                createdAt: serverTimestamp()
            });
            setSuccess(true);
        } catch (error) {
            console.error("Başvuru hatası:", error);
            alert("Başvuru gönderilirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center pt-20">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 text-primary">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Başvurunuz Alındı! 🚀</h1>
                    <p className="text-gray-400 max-w-md mb-8">
                        Organizatörlük başvurunuz başarıyla yöneticilerimize iletildi. İnceleme sonrası size e-posta ile bilgi vereceğiz.
                    </p>
                    <button onClick={() => router.push("/panel")} className="px-8 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-all">
                        Panelime Dön
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    if (role === 'organizer' || role === 'admin') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center pt-20">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-500">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Zaten Yetkilisiniz!</h1>
                    <p className="text-gray-400 max-w-md mb-8">
                        Hesabınız zaten Organizatör veya Admin yetkisine sahip. Kredi kartı ile satış yapmaya hemen başlayabilirsiniz.
                    </p>
                    <button onClick={() => router.push("/etkinlik-olustur")} className="px-8 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-all">
                        Etkinlik Oluştur
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            <div className="container mx-auto px-4 py-12 pt-28 flex-1">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12">

                    {/* Sol: Bilgi */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <h1 className="text-4xl font-bold mb-4">Organizatör Ol 🎭</h1>
                            <p className="text-gray-400 leading-relaxed">
                                Sivas Etkinlikleri platformunda profesyonel etkinlikler düzenlemek ve biletlerinizi kredi kartı ile satmak için başvurunuzu yapın.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Kredi Kartı ile Satış</h4>
                                    <p className="text-sm text-gray-500">PayTR güvencesiyle biletlerinizi anında satın.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Gelişmiş Raporlama</h4>
                                    <p className="text-sm text-gray-500">Satışlarınızı ve katılımcı listelerinizi detaylı takip edin.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 shrink-0">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Güvenilir Profil</h4>
                                    <p className="text-sm text-gray-500">Doğrulanmış organizatör rozeti ile kullanıcı güvenini kazanın.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex items-start gap-3">
                            <Info className="w-5 h-5 text-yellow-500 shrink-0" />
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Başvurular genellikle 24-48 saat içerisinde sonuçlandırılır. Onay durumunda platform üzerinden bakiye ve ödeme takibi yapabileceksiniz.
                            </p>
                        </div>
                    </div>

                    {/* Sağ: Form */}
                    <div className="flex-1 bg-zinc-900/50 p-8 rounded-3xl border border-white/10 shadow-xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ad Soyad / Kurum Adı</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:border-primary focus:outline-none placeholder-zinc-700 transition-all"
                                        placeholder="Mehmet Yılmaz veya X Sanat Akademisi"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">E-posta Adresi</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:border-primary focus:outline-none placeholder-zinc-700 transition-all"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Telefon Numarası</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:border-primary focus:outline-none placeholder-zinc-700 transition-all"
                                        placeholder="05xx xxx xx xx"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Deneyim Seviyesi</label>
                                    <select
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:border-primary focus:outline-none transition-all cursor-pointer"
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    >
                                        <option value="new">Yeni Başlıyorum</option>
                                        <option value="intermediate">Orta Ölçekli Etkinlikler</option>
                                        <option value="professional">Profesyonel Organizatör</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kendinizi / İşinizi Tanıtın</label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:border-primary focus:outline-none placeholder-zinc-700 transition-all resize-none"
                                        placeholder="Hangi tür etkinlikler planlıyorsunuz? Daha önce biletli etkinlik yaptınız mı?"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group shadow-glow"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        Başvuruyu Gönder
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
