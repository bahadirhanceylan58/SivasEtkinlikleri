"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_SPONSORSHIP_TIERS } from '@/lib/sponsorship';
import SponsorTierCard from '@/components/SponsorTierCard';
import { Upload, Building2, Globe, MessageSquare, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function SponsorApplicationPage() {
    const { eventId } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTier, setSelectedTier] = useState<string>('');
    const [formData, setFormData] = useState({
        companyName: '',
        website: '',
        contactEmail: user?.email || '',
        message: ''
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!user) {
            alert('Sponsor olmak için giriş yapmalısınız!');
            router.push('/login');
            return;
        }

        const fetchEvent = async () => {
            if (!eventId) return;
            try {
                const docRef = doc(db, 'events', eventId as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setEvent({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (error) {
                console.error('Error fetching event:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [eventId, user, router]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTier) {
            alert('Lütfen bir sponsorluk tier\'ı seçin.');
            return;
        }

        if (!logoFile) {
            alert('Lütfen bir logo yükleyin.');
            return;
        }

        setSubmitting(true);

        try {
            // Logo yükle
            const logoRef = ref(storage, `sponsors/${Date.now()}_${logoFile.name}`);
            await uploadBytes(logoRef, logoFile);
            const logoUrl = await getDownloadURL(logoRef);

            const selectedTierData = DEFAULT_SPONSORSHIP_TIERS.find(t => t.id === selectedTier);

            // Sponsor başvurusu kaydet
            await addDoc(collection(db, 'sponsors'), {
                eventId: eventId,
                userId: user?.uid,
                tier: selectedTier,
                amount: selectedTierData?.amount || 0,
                companyName: formData.companyName,
                logoUrl: logoUrl,
                website: formData.website,
                contactEmail: formData.contactEmail,
                message: formData.message,
                displayOnSite: true,
                status: 'pending',
                createdAt: new Date()
            });

            setSuccess(true);
            setTimeout(() => {
                router.push(`/etkinlik/${eventId}`);
            }, 3000);
        } catch (error) {
            console.error('Error submitting sponsorship:', error);
            alert('Başvuru gönderilirken bir hata oluştu.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                Yükleniyor...
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                Etkinlik bulunamadı.
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 transition-colors duration-300">
                <div className="bg-card border border-green-500/30 p-8 rounded-2xl text-center max-w-md w-full animate-fadeIn">
                    <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Başvurunuz Alındı!</h2>
                    <p className="text-muted-foreground mb-6">
                        Sponsorluk başvurunuz değerlendirmeye alındı. Onaylandığında etkinlik sayfasında görüneceksiniz.
                    </p>
                    <button
                        onClick={() => router.push(`/etkinlik/${eventId}`)}
                        className="bg-primary text-black hover:bg-primary-hover w-full py-3 rounded-lg font-bold transition-colors"
                    >
                        Etkinliğe Dön
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-4 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Sponsor Başvurusu</h1>
                    <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">{event.title}</span> etkinliğine sponsor olun
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Tier Selection */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Sponsorluk Seviyesi Seçin</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {DEFAULT_SPONSORSHIP_TIERS.map(tier => (
                                <SponsorTierCard
                                    key={tier.id}
                                    tier={tier}
                                    selected={selectedTier === tier.id}
                                    onSelect={() => setSelectedTier(tier.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
                        <h2 className="text-2xl font-bold mb-4">Sponsor Bilgileri</h2>

                        {/* Company Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Şirket/Kurum Adı *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                placeholder="Örn: ABC Teknoloji A.Ş."
                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-colors"
                            />
                        </div>

                        {/* Logo Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Logo *
                            </label>
                            <div className="flex items-start gap-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                    id="logo-upload"
                                />
                                <label
                                    htmlFor="logo-upload"
                                    className="flex-1 bg-muted/50 border-2 border-dashed border-border rounded-xl px-4 py-8 text-center cursor-pointer hover:border-primary transition-colors"
                                >
                                    {logoPreview ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="relative w-32 h-32">
                                                <Image
                                                    src={logoPreview}
                                                    alt="Logo preview"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                            <span className="text-sm text-muted-foreground">Değiştirmek için tıklayın</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <Upload className="w-12 h-12 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">Logo yüklemek için tıklayın</span>
                                            <span className="text-xs text-muted-foreground">PNG, JPG veya SVG</span>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Website */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Website (Opsiyonel)
                            </label>
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                placeholder="https://sirketiniz.com"
                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-colors"
                            />
                        </div>

                        {/* Contact Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">İletişim E-postası *</label>
                            <input
                                type="email"
                                required
                                value={formData.contactEmail}
                                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                placeholder="sponsor@sirket.com"
                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-colors"
                            />
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Mesaj (Opsiyonel)
                            </label>
                            <textarea
                                rows={4}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Etkinlik organizatörlerine mesajınız..."
                                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none resize-none transition-colors"
                            ></textarea>
                        </div>
                    </div>

                    {/* Summary & Submit */}
                    {selectedTier && (
                        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
                            <h3 className="text-xl font-bold mb-4">Özet</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Sponsorluk Seviyesi:</span>
                                    <span className="font-bold text-foreground">
                                        {DEFAULT_SPONSORSHIP_TIERS.find(t => t.id === selectedTier)?.name}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tutar:</span>
                                    <span className="font-bold text-primary">
                                        {DEFAULT_SPONSORSHIP_TIERS.find(t => t.id === selectedTier)?.amount.toLocaleString('tr-TR')}₺
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-4">
                                * Başvurunuz onaylandıktan sonra ödeme detayları iletilecektir.
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting || !selectedTier}
                        className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
                    </button>
                </form>
            </div>
        </div>
    );
}
