'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Upload, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Toast from '@/components/Toast';

const KursOlusturPage = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        // Step 1: Temel Bilgiler
        title: '',
        shortDescription: '',
        description: '',
        category: '',
        subCategory: '',

        // Step 2: Eğitmen Profili
        instructorBio: '',

        // Step 3: Kurs Detayları
        difficulty: 'Başlangıç' as 'Başlangıç' | 'Orta' | 'İleri',
        duration: 0,
        language: 'Türkçe',
        locationType: 'online' as 'online' | 'physical' | 'hybrid',
        location: '',
        startDate: '',
        endDate: '',
        schedule: [{ day: '', time: '' }],

        // Step 4: Müfredat
        curriculum: [{ week: 1, title: '', topics: [''] }],
        requirements: [''],
        whatYouWillLearn: [''],

        // Step 5: Kayıt Bilgileri
        maxStudents: 0,
        price: 0,
    });

    const categories = [
        'Yazılım', 'Dil', 'Sanat', 'Spor', 'Müzik',
        'İş ve Girişimcilik', 'Kişisel Gelişim', 'Diğer'
    ];

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayAdd = (field: keyof typeof formData) => {
        const current = formData[field] as any[];
        if (field === 'schedule') {
            handleInputChange(field, [...current, { day: '', time: '' }]);
        } else if (field === 'curriculum') {
            handleInputChange(field, [...current, { week: current.length + 1, title: '', topics: [''] }]);
        } else {
            handleInputChange(field, [...current, '']);
        }
    };

    const handleArrayRemove = (field: keyof typeof formData, index: number) => {
        const current = formData[field] as any[];
        handleInputChange(field, current.filter((_, i) => i !== index));
    };

    const handleArrayItemChange = (field: keyof typeof formData, index: number, value: any) => {
        const current = formData[field] as any[];
        const updated = [...current];
        updated[index] = value;
        handleInputChange(field, updated);
    };

    const handleCurriculumTopicChange = (currIndex: number, topicIndex: number, value: string) => {
        const updated = [...formData.curriculum];
        updated[currIndex].topics[topicIndex] = value;
        handleInputChange('curriculum', updated);
    };

    const handleCurriculumTopicAdd = (currIndex: number) => {
        const updated = [...formData.curriculum];
        updated[currIndex].topics.push('');
        handleInputChange('curriculum', updated);
    };

    const handleCurriculumTopicRemove = (currIndex: number, topicIndex: number) => {
        const updated = [...formData.curriculum];
        updated[currIndex].topics = updated[currIndex].topics.filter((_, i) => i !== topicIndex);
        handleInputChange('curriculum', updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setToast({ message: 'Kurs oluşturmak için giriş yapmalısınız', type: 'error' });
            return;
        }

        setLoading(true);

        try {
            // Upload image
            let imageUrl = '';
            if (imageFile) {
                const storageRef = ref(storage, `courses/${Date.now()}_${imageFile.name}`);
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            // Create course
            const courseRef = await addDoc(collection(db, 'courses'), {
                ...formData,
                imageUrl,
                instructorId: user.uid,
                instructorName: user.displayName || user.email?.split('@')[0] || 'Anonim',
                instructorEmail: user.email, // Email bildirimi için gerekli
                instructorImage: user.photoURL || null,
                enrolledCount: 0,
                status: 'pending', // Admin onayı gerekli
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // Email bildirimi gönder
            // Email bildirimi devre dışı bırakıldı
            /*
            try {
                await fetch('/api/email/send-registration', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: 'course',
                        userEmail: user.email,
                        registrationData: {
                            userName: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
                            courseTitle: formData.title,
                            courseDescription: formData.shortDescription,
                            userEmail: user.email,
                            userPhone: user.phoneNumber || 'Belirtilmemiş',
                        },
                    }),
                });
            } catch (emailError) {
                console.error('Email gönderim hatası:', emailError);
                // Email hatası kurs oluşturmayı engellemez
            }
            */

            setToast({ message: 'Kurs başarıyla oluşturuldu! Admin onayından sonra yayınlanacak.', type: 'success' });

            setTimeout(() => {
                router.push('/kurslarim');
            }, 2000);
        } catch (error) {
            console.error('Kurs oluşturma hatası:', error);
            setToast({ message: 'Kurs oluşturulurken bir hata oluştu', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (currentStep < 5) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="glass p-8 rounded-2xl max-w-md text-center">
                    <h2 className="text-2xl font-bold mb-4">Giriş Gerekli</h2>
                    <p className="text-muted-foreground mb-6">Kurs oluşturmak için giriş yapmalısınız.</p>
                    <Link href="/login" className="px-6 py-3 bg-primary text-black rounded-full font-semibold hover:bg-primary/90 transition-all inline-block">
                        Giriş Yap
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/kurslar" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kurslara Dön
                    </Link>
                    <h1 className="text-4xl font-bold">Yeni Kurs Oluştur</h1>
                    <p className="text-muted-foreground mt-2">
                        Bilginizi paylaşın ve öğrencilere ulaşın
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8 flex items-center justify-between">
                    {[1, 2, 3, 4, 5].map(step => (
                        <div key={step} className="flex items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= step ? 'bg-primary text-black' : 'bg-muted text-muted-foreground'
                                }`}>
                                {step}
                            </div>
                            {step < 5 && (
                                <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${currentStep > step ? 'bg-primary' : 'bg-muted'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl">
                    {/* Step 1: Temel Bilgiler */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-4">Temel Bilgiler</h2>

                            <div>
                                <label className="block text-sm font-medium mb-2">Kurs Başlığı *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Örn: Python ile Programlamaya Giriş"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Kısa Açıklama *</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={150}
                                    value={formData.shortDescription}
                                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Kurs kartında görünecek kısa açıklama"
                                />
                                <p className="text-xs text-muted-foreground mt-1">{formData.shortDescription.length}/150 karakter</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Detaylı Açıklama *</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-foreground placeholder:opacity-70"
                                    placeholder="Kursunuz hakkında detaylı bilgi verin"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Kategori *</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => handleInputChange('category', e.target.value)}
                                        className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-foreground placeholder:opacity-70"
                                    >
                                        <option value="">Seçin</option>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Alt Kategori</label>
                                    <input
                                        type="text"
                                        value={formData.subCategory}
                                        onChange={(e) => handleInputChange('subCategory', e.target.value)}
                                        className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-foreground placeholder:opacity-70"
                                        placeholder="Örn: Web Geliştirme"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Kurs Görseli</label>
                                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImageFile(null);
                                                    setImagePreview(null);
                                                }}
                                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                                            <p className="text-muted-foreground mb-2">Görsel yüklemek için tıklayın</p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageSelect}
                                                className="hidden"
                                                id="image-upload"
                                            />
                                            <label htmlFor="image-upload" className="cursor-pointer px-4 py-2 bg-primary text-black rounded-lg inline-block hover:bg-primary/90">
                                                Dosya Seç
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Eğitmen Profili */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-4">Eğitmen Profili</h2>

                            <div className="glass-strong p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">Eğitmen</p>
                                <p className="font-semibold">{user.displayName || user.email}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Biyografi</label>
                                <textarea
                                    rows={5}
                                    value={formData.instructorBio}
                                    onChange={(e) => handleInputChange('instructorBio', e.target.value)}
                                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-foreground placeholder:opacity-70"
                                    placeholder="Kendiniz hakkında bilgi verin (uzmanlık alanlarınız, deneyimleriniz vb.)"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Kurs Detayları */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-4">Kurs Detayları</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Seviye *</label>
                                    <select
                                        required
                                        value={formData.difficulty}
                                        onChange={(e) => handleInputChange('difficulty', e.target.value)}
                                        className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="Başlangıç">Başlangıç</option>
                                        <option value="Orta">Orta</option>
                                        <option value="İleri">İleri</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Süre (Saat) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.duration}
                                        onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                                        className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Dil *</label>
                                    <select
                                        required
                                        value={formData.language}
                                        onChange={(e) => handleInputChange('language', e.target.value)}
                                        className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="Türkçe">Türkçe</option>
                                        <option value="İngilizce">İngilizce</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Lokasyon Tipi *</label>
                                    <select
                                        required
                                        value={formData.locationType}
                                        onChange={(e) => handleInputChange('locationType', e.target.value)}
                                        className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="online">Online</option>
                                        <option value="physical">Fiziksel Mekan</option>
                                        <option value="hybrid">Hibrit</option>
                                    </select>
                                </div>
                            </div>

                            {(formData.locationType === 'physical' || formData.locationType === 'hybrid') && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Mekan Adresi *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Örn: Sivas Cumhuriyet Üniversitesi, A Blok"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Başlangıç Tarihi *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                                        className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Bitiş Tarihi *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                                        className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Ders Programı</label>
                                {formData.schedule.map((sch, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder="Gün (örn: Pazartesi)"
                                            value={sch.day}
                                            onChange={(e) => handleArrayItemChange('schedule', index, { ...sch, day: e.target.value })}
                                            className="flex-1 px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Saat (örn: 19:00-21:00)"
                                            value={sch.time}
                                            onChange={(e) => handleArrayItemChange('schedule', index, { ...sch, time: e.target.value })}
                                            className="flex-1 px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => handleArrayRemove('schedule', index)}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => handleArrayAdd('schedule')}
                                    className="text-primary hover:underline text-sm inline-flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> Gün Ekle
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Müfredat */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-4">Müfredat ve İçerik</h2>

                            <div>
                                <label className="block text-sm font-medium mb-2">Haftalık İçerik</label>
                                {formData.curriculum.map((curr, currIndex) => (
                                    <div key={currIndex} className="glass-strong p-4 rounded-lg mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold">Hafta {curr.week}</h3>
                                            {currIndex > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleArrayRemove('curriculum', currIndex)}
                                                    className="text-red-500 hover:bg-red-500/10 p-1 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Hafta başlığı"
                                            value={curr.title}
                                            onChange={(e) => handleArrayItemChange('curriculum', currIndex, { ...curr, title: e.target.value })}
                                            className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 mb-2"
                                        />
                                        {curr.topics.map((topic, topicIndex) => (
                                            <div key={topicIndex} className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    placeholder="Konu"
                                                    value={topic}
                                                    onChange={(e) => handleCurriculumTopicChange(currIndex, topicIndex, e.target.value)}
                                                    className="flex-1 px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                />
                                                {topicIndex > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCurriculumTopicRemove(currIndex, topicIndex)}
                                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => handleCurriculumTopicAdd(currIndex)}
                                            className="text-primary hover:underline text-sm inline-flex items-center gap-1"
                                        >
                                            <Plus className="w-4 h-4" /> Konu Ekle
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => handleArrayAdd('curriculum')}
                                    className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 inline-flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Hafta Ekle
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Ön Koşullar</label>
                                {formData.requirements.map((req, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder="Ön koşul"
                                            value={req}
                                            onChange={(e) => handleArrayItemChange('requirements', index, e.target.value)}
                                            className="flex-1 px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => handleArrayRemove('requirements', index)}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => handleArrayAdd('requirements')}
                                    className="text-primary hover:underline text-sm inline-flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> Ekle
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Öğrenilecekler</label>
                                {formData.whatYouWillLearn.map((item, index) => (
                                    <div key={index} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            placeholder="Öğrenilecek beceri/bilgi"
                                            value={item}
                                            onChange={(e) => handleArrayItemChange('whatYouWillLearn', index, e.target.value)}
                                            className="flex-1 px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        />
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => handleArrayRemove('whatYouWillLearn', index)}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => handleArrayAdd('whatYouWillLearn')}
                                    className="text-primary hover:underline text-sm inline-flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> Ekle
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Kayıt Bilgileri */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold mb-4">Kayıt Bilgileri</h2>

                            <div>
                                <label className="block text-sm font-medium mb-2">Maksimum Öğrenci Sayısı *</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.maxStudents}
                                    onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Kurs Ücreti (₺)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => handleInputChange('price', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="0 = Ücretsiz"
                                />
                            </div>

                            <div className="glass-strong p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    ℹ️ Kursunuz oluşturulduktan sonra admin onayı bekleyecektir. Onaylandıktan sonra kurslarda görünür olacaktır.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-border">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="px-6 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Geri
                        </button>

                        {currentStep < 5 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="px-6 py-2 bg-primary text-black rounded-lg hover:bg-primary/90"
                            >
                                İleri
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 inline-flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Oluşturuluyor...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Kursu Oluştur
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default KursOlusturPage;
