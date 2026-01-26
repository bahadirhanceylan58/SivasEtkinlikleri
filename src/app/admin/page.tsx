"use client";

import {
    Users,
    Calendar,
    Clock,
    Check,
    X,
    LogOut,
    LayoutDashboard,
    Search,
    Bell,
    PlusCircle,
    Image as ImageIcon,
    Trash2,
    Edit2,
    Plus,
    Minus,
    Upload,
    Globe,
    Eye
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CATEGORIES } from '@/data/mockData';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, Timestamp, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

export default function AdminPage() {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'events' | 'applications'>('events');
    const [eventViewMode, setEventViewMode] = useState<'list' | 'form'>('list');

    // Form States
    const [title, setTitle] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [ticketTypes, setTicketTypes] = useState<{ name: string, price: number }[]>([{ name: 'Genel Giriş', price: 0 }]);
    const [salesType, setSalesType] = useState<'internal' | 'external'>('internal');
    const [externalUrl, setExternalUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Management State
    const [events, setEvents] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Participants Modal State
    const [participants, setParticipants] = useState<any[]>([]);
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
    const [selectedEventTitle, setSelectedEventTitle] = useState('');

    // Flatten Categories for Dropdown
    const allSubCategories = CATEGORIES.flatMap(cat =>
        cat.sub.map(sub => ({ name: sub, parentId: cat.id, parentName: cat.name }))
    );

    // Set default subcategory on mount
    useEffect(() => {
        if (allSubCategories.length > 0 && !subCategory) {
            setSubCategory(allSubCategories[0].name);
        }
        fetchEvents();
        fetchApplications();
    }, []);

    useEffect(() => {
        if (!loading) {
            if (!user || !isAdmin) {
                router.push('/');
            }
        }
    }, [user, loading, isAdmin, router]);

    const fetchEvents = async () => {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(eventsList);
    };

    const fetchApplications = async () => {
        const querySnapshot = await getDocs(collection(db, "club_applications"));
        const appsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setApplications(appsList);
    };

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await updateDoc(doc(db, "club_applications", id), {
                status: status,
                updatedAt: new Date()
            });

            if (status === 'approved') {
                const appDoc = await getDocs(query(collection(db, "club_applications"), where("__name__", "==", id)));
                if (!appDoc.empty) {
                    const appData = appDoc.docs[0].data();
                    await addDoc(collection(db, 'clubs'), {
                        name: appData.name,
                        description: appData.description,
                        category: appData.category,
                        imageUrl: appData.imageUrl,
                        email: appData.email,
                        adminId: appData.userId,
                        memberCount: 1,
                        createdAt: new Date()
                    });
                }
            }

            alert(`Başvuru ${status === 'approved' ? 'onaylandı ve kulüp oluşturuldu' : 'reddedildi'}.`);
            fetchApplications();
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Durum güncellenirken hata oluştu.");
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImageUrl(previewUrl);
        }
    };

    const handleAddTicket = () => {
        setTicketTypes([...ticketTypes, { name: '', price: 0 }]);
    };

    const handleRemoveTicket = (index: number) => {
        const newTickets = [...ticketTypes];
        newTickets.splice(index, 1);
        setTicketTypes(newTickets);
    };

    const handleTicketChange = (index: number, field: 'name' | 'price', value: any) => {
        const newTickets = [...ticketTypes];
        // @ts-ignore
        newTickets[index][field] = value;
        setTicketTypes(newTickets);
    };

    const handleDeleteEvent = async (id: string) => {
        if (confirm('Bu etkinliği silmek istediğinize emin misiniz?')) {
            try {
                await deleteDoc(doc(db, "events", id));
                fetchEvents();
                alert('Etkinlik silindi.');
            } catch (error) {
                console.error("Error deleting document: ", error);
                alert('Silme hatası.');
            }
        }
    };

    const handleEditEvent = (event: any) => {
        setEditingId(event.id);
        setTitle(event.title);
        setSubCategory(event.subCategory || allSubCategories[0].name);
        setDate(event.date);
        setLocation(event.location);
        setTicketTypes(event.ticketTypes || [{ name: 'Standart', price: 0 }]);
        setSalesType(event.salesType || 'internal');
        setExternalUrl(event.externalUrl || '');
        setImageUrl(event.imageUrl);
        setActiveTab('events');
        setEventViewMode('form');
    };

    const handleCreateOrUpdateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const selectedSub = allSubCategories.find(s => s.name === subCategory);
        if (!selectedSub) {
            alert('Kategori seçimi geçersiz.');
            setSubmitting(false);
            return;
        }

        try {
            let finalImageUrl = imageUrl;

            if (imageFile) {
                const storageRef = ref(storage, `events/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                finalImageUrl = await getDownloadURL(snapshot.ref);
            }

            const eventData = {
                title,
                category: selectedSub.parentId,
                subCategory: selectedSub.name,
                date,
                location,
                imageUrl: finalImageUrl,
                ticketTypes,
                salesType,
                externalUrl: salesType === 'external' ? externalUrl : null,
                updatedAt: new Date()
            };

            if (editingId) {
                await updateDoc(doc(db, "events", editingId), eventData);
                alert('Etkinlik güncellendi!');
            } else {
                await addDoc(collection(db, "events"), {
                    ...eventData,
                    createdAt: new Date()
                });
                alert('Etkinlik başarıyla oluşturuldu!');
            }

            setEventViewMode('list');
            fetchEvents();
            resetForm();
        } catch (error) {
            console.error("Error creating/updating document: ", error);
            const errorMessage = (error as any).message || 'Bilinmeyen bir hata oluştu.';
            alert('Yükleme hatası: ' + errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const fetchParticipants = async (eventId: string, eventTitle: string) => {
        try {
            const querySnapshot = await getDocs(collection(db, "events", eventId, "reservations"));
            const participantsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setParticipants(participantsList);
            setSelectedEventTitle(eventTitle);
            setIsParticipantsModalOpen(true);
        } catch (error) {
            console.error("Error fetching participants:", error);
            alert("Katılımcı listesi alınamadı.");
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setSubCategory(allSubCategories[0]?.name || '');
        setDate('');
        setLocation('');
        setTicketTypes([{ name: 'Genel Giriş', price: 0 }]);
        setSalesType('internal');
        setExternalUrl('');
        setImageFile(null);
        setImageUrl('');
    };

    if (loading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white">Yükleniyor...</div>;
    }

    return (
        <div className="min-h-screen bg-black flex text-white font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 hidden lg:flex flex-col bg-white/5">
                <div className="h-16 flex items-center px-6 border-b border-white/10">
                    <span className="text-xl font-bold text-primary">Sivas Etkinlik</span>
                    <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded text-gray-400">Admin</span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <button
                        onClick={() => { setActiveTab('events'); setEventViewMode('list'); fetchEvents(); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'events' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Calendar className="w-5 h-5" />
                        Etkinlik Yönetimi
                    </button>
                    <button
                        onClick={() => { setActiveTab('applications'); fetchApplications(); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'applications' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Users className="w-5 h-5" />
                        Kulüp Başvuruları
                        {applications.some(a => a.status === 'pending') && (
                            <span className="ml-auto w-2 h-2 rounded-full bg-red-500"></span>
                        )}
                    </button>
                </nav>

                <div className="p-4 border-t border-white/10 space-y-1">
                    <Link href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl font-medium transition-colors">
                        <Globe className="w-5 h-5" />
                        Siteyi Görüntüle
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md sticky top-0 z-10">
                    <h1 className="text-xl font-bold">
                        {activeTab === 'events' ? (eventViewMode === 'list' ? 'Etkinlik Listesi' : (editingId ? 'Etkinlik Düzenle' : 'Yeni Etkinlik')) : 'Kulüp Başvuruları'}
                    </h1>
                    <div className="flex items-center gap-4">
                        {activeTab === 'events' && eventViewMode === 'list' && (
                            <button onClick={() => { resetForm(); setEventViewMode('form'); }} className="btn btn-sm bg-primary text-black hover:bg-primary/90 font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Yeni Ekle
                            </button>
                        )}
                        {activeTab === 'events' && eventViewMode === 'form' && (
                            <button onClick={() => { resetForm(); setEventViewMode('list'); }} className="text-sm text-gray-400 hover:text-white">
                                Listeye Dön
                            </button>
                        )}
                    </div>
                </header>

                <div className="p-8 space-y-8">
                    {/* EVENTS TAB */}
                    {activeTab === 'events' && eventViewMode === 'list' && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-black/20 text-gray-400 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Etkinlik Adı</th>
                                            <th className="px-6 py-4">Tarih</th>
                                            <th className="px-6 py-4">Kategori</th>
                                            <th className="px-6 py-4 text-right">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {events.map((event) => (
                                            <tr key={event.id} className="hover:bg-neutral-800 transition-colors group">
                                                <td className="px-6 py-4 font-medium text-white">
                                                    {event.title}
                                                </td>
                                                <td className="px-6 py-4 text-gray-300">{event.date?.toString().replace('T', ' ')}</td>
                                                <td className="px-6 py-4 text-gray-300">{event.subCategory}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link href={`/etkinlik/${event.id}`} target="_blank" className="p-2 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white rounded-lg transition-all" aria-label="Görüntüle">
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <button onClick={() => fetchParticipants(event.id, event.title)} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-all" title="Katılımcılar">
                                                            <Users className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleEditEvent(event)} aria-label="Düzenle" className="p-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded-lg transition-all">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteEvent(event.id)} aria-label="Sil" className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'events' && eventViewMode === 'form' && (
                        <div className="max-w-3xl mx-auto">
                            <form onSubmit={handleCreateOrUpdateEvent} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                                {/* Form content reused from previous implementation */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Etkinlik Adı</label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                                        placeholder="Örn: Melek Mosso Konseri"
                                    />
                                </div>
                                {/* ... Other fields ... */}
                                {/* Keeping simplicity, copying key fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Kategori</label>
                                        <div className="relative">
                                            <select
                                                value={subCategory}
                                                onChange={(e) => setSubCategory(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-primary/50"
                                            >
                                                {allSubCategories.map(sub => (
                                                    <option key={sub.name} value={sub.name} className="bg-black">
                                                        {sub.name} ({sub.parentName})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Tarih & Saat</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Mekan / Konum</label>
                                    <input
                                        type="text"
                                        required
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                                {/* Ticket Types */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-300 flex justify-between items-center">
                                        Bilet Kategorileri
                                        <button type="button" onClick={handleAddTicket} className="text-xs text-primary hover:underline flex items-center gap-1">
                                            <Plus size={12} /> Kategori Ekle
                                        </button>
                                    </label>
                                    {ticketTypes.map((ticket, index) => (
                                        <div key={index} className="flex gap-3 items-center">
                                            <input
                                                type="text"
                                                placeholder="Kategori Adı"
                                                value={ticket.name}
                                                onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                                                required
                                            />
                                            <input
                                                type="number"
                                                placeholder="Fiyat"
                                                value={ticket.price}
                                                onChange={(e) => handleTicketChange(index, 'price', Number(e.target.value))}
                                                className="w-24 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                                                required
                                                min="0"
                                            />
                                            {ticketTypes.length > 1 && (
                                                <button type="button" onClick={() => handleRemoveTicket(index)} className="p-3 text-red-400 hover:bg-white/5 rounded-xl transition-colors"><Trash2 size={18} /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {/* Sales Type & Image Upload logic similiar to prior implementation */}
                                <div className="space-y-3 bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
                                    <label className="text-sm font-medium text-gray-300">Satış Türü</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="radio" name="salesType" value="internal" checked={salesType === 'internal'} onChange={(e) => setSalesType(e.target.value as any)} className="accent-primary" />
                                            <span className="text-sm text-white">Site İçi</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="radio" name="salesType" value="external" checked={salesType === 'external'} onChange={(e) => setSalesType(e.target.value as any)} className="accent-primary" />
                                            <span className="text-sm text-white">Dış Bağlantı</span>
                                        </label>
                                    </div>
                                    {salesType === 'external' && (
                                        <input type="url" required value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="Link" className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white" />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Görsel</label>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-primary file:text-black hover:file:bg-primary/90" />
                                </div>

                                <button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl transition-all shadow-lg">
                                    {submitting ? 'İşleniyor...' : (editingId ? 'Güncelle' : 'Oluştur')}
                                </button>
                            </form>
                        </div>
                    )}


                    {/* APPLICATIONS TAB */}
                    {activeTab === 'applications' && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            {applications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">Henüz başvuru yok.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-black/20 text-gray-400 font-medium">
                                            <tr>
                                                <th className="px-6 py-4">Topluluk Adı</th>
                                                <th className="px-6 py-4">Başvuran</th>
                                                <th className="px-6 py-4">Kategori</th>
                                                <th className="px-6 py-4">Durum</th>
                                                <th className="px-6 py-4 text-right">İşlemler</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {applications.filter(a => a.status === 'pending').map((app) => (
                                                <tr key={app.id} className="hover:bg-neutral-800 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-white">{app.name}</td>
                                                    <td className="px-6 py-4 text-gray-300">
                                                        <div>{app.userName}</div>
                                                        <div className="text-xs text-gray-500">{app.userEmail}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-300 capitalize">{app.category}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 rounded text-xs font-bold border bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                                            Bekliyor
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => handleUpdateStatus(app.id, 'approved')} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all" title="Onayla">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="Reddet">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Participants Modal */}
                {isParticipantsModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsParticipantsModalOpen(false)}>
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedEventTitle}</h3>
                                    <p className="text-gray-400 text-sm mt-1">Katılımcı Listesi</p>
                                </div>
                                <button onClick={() => setIsParticipantsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="mb-4 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center justify-between">
                                    <span className="text-blue-400 font-medium">Toplam Rezervasyon</span>
                                    <span className="text-2xl font-bold text-blue-500">{participants.reduce((acc, curr) => acc + (curr.ticketCount || 1), 0)} Kişi</span>
                                </div>

                                {participants.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">Henüz katılımcı bulunmuyor.</div>
                                ) : (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-black/20 text-gray-400 font-medium">
                                            <tr>
                                                <th className="px-4 py-3">Ad Soyad</th>
                                                <th className="px-4 py-3">Telefon</th>
                                                <th className="px-4 py-3">Bilet</th>
                                                <th className="px-4 py-3">Tarih</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {participants.map((p, i) => (
                                                <tr key={i} className="hover:bg-white/5">
                                                    <td className="px-4 py-3 font-medium text-white">{p.contactName || 'İsimsiz'}</td>
                                                    <td className="px-4 py-3 text-gray-300">{p.contactPhone || '-'}</td>
                                                    <td className="px-4 py-3 text-gray-300">{p.ticketCount} Adet</td>
                                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                                        {p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString() : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
