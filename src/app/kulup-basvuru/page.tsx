'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ClubApplicationPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'sanat',
        imageUrl: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!user) {
            setError('Başvuru yapmak için giriş yapmalısınız.');
            setLoading(false);
            return;
        }

        try {
            await addDoc(collection(db, 'club_applications'), {
                ...formData,
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName || 'Kullanıcı',
                status: 'pending',
                createdAt: serverTimestamp()
            });
            setSuccess(true);
            setTimeout(() => {
                router.push('/profil');
            }, 3000);
        } catch (err) {
            console.error("Error submitting application:", err);
            setError('Başvuru gönderilirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-card border border-green-500/30 p-8 rounded-2xl text-center max-w-md w-full animate-fadeIn">
                        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Başvurunuz Alındı!</h2>
                        <p className="text-muted-foreground mb-6">Topluluk oluşturma talebiniz değerlendirmeye alındı. Sonucu profil sayfanızdan takip edebilirsiniz.</p>
                        <button onClick={() => router.push('/profil')} className="btn btn-primary w-full py-3 rounded-lg font-bold">
                            Profilime Git
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
            <Navbar />
            <div className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2">Topluluk Başvurusu</h1>
                    <p className="text-muted-foreground mb-8">Kendi topluluğunu kur, etkinlikler düzenle ve insanları bir araya getir.</p>

                    <form onSubmit={handleSubmit} className="bg-card border border-border p-8 rounded-2xl space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-2">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Topluluk Adı</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Örn: Sivas Fotoğrafçılık Kulübü"
                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Kategori</label>
                            <div className="relative">
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    aria-label="Kategori Seç"
                                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground appearance-none focus:border-primary focus:outline-none transition-colors"
                                >
                                    <option value="sanat">Sanat & Kültür</option>
                                    <option value="spor">Spor & Aktivite</option>
                                    <option value="gezi">Gezi & Kamp</option>
                                    <option value="egitim">Eğitim & Kariyer</option>
                                    <option value="eglence">Eğlence & Oyun</option>
                                    <option value="diger">Diğer</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Hakkında</label>
                            <textarea
                                name="description"
                                required
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Topluluğunuzun amacı nedir? Neler yapacaksınız?"
                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:outline-none resize-none transition-colors"
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Kapak Görseli URL</label>
                            <input
                                type="url"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:outline-none transition-colors"
                            />
                            <p className="text-xs text-muted-foreground">Şimdilik sadece resim linki kabul ediyoruz.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">İletişim E-postası</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="ornek@kulup.com"
                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:outline-none transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}
