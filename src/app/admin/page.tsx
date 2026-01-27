"use client";

import {
    Users,
    Calendar,
    LayoutDashboard,
    Tag,
    QrCode,
    Check,
    X,
    Eye,
    Trash2,
    Edit2,
    Plus,
    Globe
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CATEGORIES } from '@/data/mockData';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

// New Components
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserManagement from '@/components/admin/UserManagement';
import TicketValidator from '@/components/admin/TicketValidator';

export default function AdminPage() {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'applications' | 'discounts' | 'users' | 'validator'>('dashboard');
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

    // Participants State (Simplified)
    const [participants, setParticipants] = useState<any[]>([]);
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
    const [selectedEventTitle, setSelectedEventTitle] = useState('');

    // Discount Codes State
    const [discountCodes, setDiscountCodes] = useState<any[]>([]);
    const [discountFormVisible, setDiscountFormVisible] = useState(false);
    const [discountFormData, setDiscountFormData] = useState({
        code: '',
        type: 'percentage' as 'percentage' | 'fixed',
        value: 0,
        maxUsage: 0,
        maxUsagePerUser: 1,
        validFrom: '',
        validUntil: '',
        minPurchaseAmount: 0,
        description: ''
    });

    // Flatten Categories
    const allSubCategories = CATEGORIES.flatMap(cat =>
        cat.sub.map(sub => ({ name: sub, parentId: cat.id, parentName: cat.name }))
    );

    useEffect(() => {
        if (allSubCategories.length > 0 && !subCategory) {
            setSubCategory(allSubCategories[0].name);
        }
        fetchEvents();
        fetchApplications();
        fetchDiscountCodes();
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

    const fetchDiscountCodes = async () => {
        const querySnapshot = await getDocs(collection(db, "discountCodes"));
        const codesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDiscountCodes(codesList);
    };

    // --- Discount Code logic ---
    const handleCreateDiscountCode = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "discountCodes"), {
                ...discountFormData,
                code: discountFormData.code.toUpperCase(),
                usedCount: 0,
                isActive: true,
                createdAt: new Date(),
                createdBy: user?.uid || 'admin'
            });
            alert('İndirim kodu oluşturuldu!');
            setDiscountFormVisible(false);
            setDiscountFormData({
                code: '', type: 'percentage', value: 0, maxUsage: 0, maxUsagePerUser: 1,
                validFrom: '', validUntil: '', minPurchaseAmount: 0, description: ''
            });
            fetchDiscountCodes();
        } catch (error) {
            console.error("Error creating discount code:", error);
            alert('Kod oluşturulurken hata oluştu.');
        }
    };

    const handleToggleCodeStatus = async (codeId: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, "discountCodes", codeId), { isActive: !currentStatus });
            fetchDiscountCodes();
        } catch (error) { console.error("Error toggling:", error); }
    };

    const handleDeleteCode = async (codeId: string) => {
        if (confirm('Bu kodu silmek istediğinize emin misiniz?')) {
            try {
                await updateDoc(doc(db, "discountCodes", codeId), { isActive: false });
                alert('Kod devre dışı bırakıldı.');
                fetchDiscountCodes();
            } catch (error) { console.error("Error deleting:", error); }
        }
    };

    // --- Application Logic ---
    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await updateDoc(doc(db, "club_applications", id), { status: status, updatedAt: new Date() });
            if (status === 'approved') {
                const appDoc = await getDocs(query(collection(db, "club_applications"), where("__name__", "==", id)));
                if (!appDoc.empty) {
                    const appData = appDoc.docs[0].data();
                    await addDoc(collection(db, 'clubs'), {
                        name: appData.name, description: appData.description, category: appData.category,
                        imageUrl: appData.imageUrl, email: appData.email, adminId: appData.userId,
                        memberCount: 1, createdAt: new Date()
                    });
                }
            }
            alert(`Başvuru ${status === 'approved' ? 'onaylandı' : 'reddedildi'}.`);
            fetchApplications();
        } catch (error) { console.error("Error:", error); alert("Hata oluştu."); }
    };

    // --- Event Form Logic ---
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImageUrl(URL.createObjectURL(file));
        }
    };

    const handleCreateOrUpdateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const selectedSub = allSubCategories.find(s => s.name === subCategory);
        if (!selectedSub) { alert('Kategori seçimi geçersiz.'); setSubmitting(false); return; }

        try {
            let finalImageUrl = imageUrl;
            if (imageFile) {
                const storageRef = ref(storage, `events/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(storageRef, imageFile);
                finalImageUrl = await getDownloadURL(snapshot.ref);
            }

            const eventData = {
                title, category: selectedSub.parentId, subCategory: selectedSub.name, date,
                location, imageUrl: finalImageUrl, ticketTypes, salesType,
                externalUrl: salesType === 'external' ? externalUrl : null, updatedAt: new Date()
            };

            if (editingId) {
                await updateDoc(doc(db, "events", editingId), eventData);
                alert('Etkinlik güncellendi!');
            } else {
                await addDoc(collection(db, "events"), { ...eventData, createdAt: new Date() });
                alert('Etkinlik oluşturuldu!');
            }
            setEventViewMode('list'); fetchEvents(); resetForm();
        } catch (error) { console.error("Error:", error); alert('Hata oluştu.'); }
        finally { setSubmitting(false); }
    };

    const handleDeleteEvent = async (id: string) => {
        if (confirm('Bu etkinliği silmek istediğinize emin misiniz?')) {
            try { await deleteDoc(doc(db, "events", id)); fetchEvents(); alert('Silindi.'); }
            catch (error) { console.error("Error:", error); alert('Hata.'); }
        }
    };

    const handleEditEvent = (event: any) => {
        setEditingId(event.id); setTitle(event.title); setSubCategory(event.subCategory || allSubCategories[0].name);
        setDate(event.date); setLocation(event.location); setTicketTypes(event.ticketTypes || [{ name: 'Standart', price: 0 }]);
        setSalesType(event.salesType || 'internal'); setExternalUrl(event.externalUrl || ''); setImageUrl(event.imageUrl);
        setActiveTab('events'); setEventViewMode('form');
    };

    const fetchParticipants = async (eventId: string, eventTitle: string) => {
        try {
            const querySnapshot = await getDocs(collection(db, "events", eventId, "reservations"));
            setParticipants(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setSelectedEventTitle(eventTitle); setIsParticipantsModalOpen(true);
        } catch (error) { console.error("Error:", error); alert("Liste alınamadı."); }
    };

    const resetForm = () => {
        setEditingId(null); setTitle(''); setSubCategory(allSubCategories[0]?.name || ''); setDate('');
        setLocation(''); setTicketTypes([{ name: 'Genel Giriş', price: 0 }]); setSalesType('internal');
        setExternalUrl(''); setImageFile(null); setImageUrl('');
    };

    const handleTicketChange = (index: number, field: 'name' | 'price', value: any) => {
        const newTickets = [...ticketTypes];
        // @ts-ignore
        newTickets[index][field] = value;
        setTicketTypes(newTickets);
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-black flex text-white font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 hidden lg:flex flex-col bg-white/5">
                <div className="h-16 flex items-center px-6 border-b border-white/10">
                    <span className="text-xl font-bold text-primary">Sivas Etkinlik</span>
                    <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded text-gray-400">Admin</span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <SidebarButton
                        active={activeTab === 'dashboard'}
                        icon={<LayoutDashboard className="w-5 h-5" />}
                        label="Dashboard"
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <SidebarButton
                        active={activeTab === 'events'}
                        icon={<Calendar className="w-5 h-5" />}
                        label="Etkinlik Yönetimi"
                        onClick={() => { setActiveTab('events'); setEventViewMode('list'); fetchEvents(); }}
                    />
                    <SidebarButton
                        active={activeTab === 'applications'}
                        icon={<Users className="w-5 h-5" />}
                        label="Kulüp Başvuruları"
                        onClick={() => { setActiveTab('applications'); fetchApplications(); }}
                        notification={applications.some(a => a.status === 'pending')}
                    />
                    <SidebarButton
                        active={activeTab === 'discounts'}
                        icon={<Tag className="w-5 h-5" />}
                        label="İndirim Kodları"
                        onClick={() => { setActiveTab('discounts'); fetchDiscountCodes(); }}
                        count={discountCodes.filter(c => c.isActive).length}
                    />
                    <SidebarButton
                        active={activeTab === 'users'}
                        icon={<Users className="w-5 h-5" />}
                        label="Kullanıcılar"
                        onClick={() => setActiveTab('users')}
                    />
                    <SidebarButton
                        active={activeTab === 'validator'}
                        icon={<QrCode className="w-5 h-5" />}
                        label="Bilet Doğrulama"
                        onClick={() => setActiveTab('validator')}
                    />
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
                    <h1 className="text-xl font-bold capitalize">
                        {activeTab === 'dashboard' && 'Genel Bakış'}
                        {activeTab === 'events' && (eventViewMode === 'list' ? 'Etkinlik Listesi' : (editingId ? 'Etkinlik Düzenle' : 'Yeni Etkinlik'))}
                        {activeTab === 'applications' && 'Kulüp Başvuruları'}
                        {activeTab === 'discounts' && 'İndirim Kodları'}
                        {activeTab === 'users' && 'Kullanıcı Yönetimi'}
                        {activeTab === 'validator' && 'Bilet Doğrulama'}
                    </h1>
                    <div className="flex items-center gap-4">
                        {activeTab === 'events' && eventViewMode === 'list' && (
                            <button onClick={() => { resetForm(); setEventViewMode('form'); }} className="btn btn-sm bg-primary text-black hover:bg-primary/90 font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Yeni Ekle
                            </button>
                        )}
                        {activeTab === 'discounts' && (
                            <button onClick={() => setDiscountFormVisible(!discountFormVisible)} className="btn btn-sm bg-primary text-black hover:bg-primary/90 font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                                <Plus className="w-4 h-4" /> {discountFormVisible ? 'İptal' : 'Yeni Kod'}
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
                    {activeTab === 'dashboard' && <AdminDashboard />}

                    {activeTab === 'users' && <UserManagement />}

                    {activeTab === 'validator' && <TicketValidator />}

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
                                                <td className="px-6 py-4 font-medium text-white">{event.title}</td>
                                                <td className="px-6 py-4 text-gray-300">{event.date?.toString().replace('T', ' ')}</td>
                                                <td className="px-6 py-4 text-gray-300">{event.subCategory}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link href={`/etkinlik/${event.id}`} target="_blank" className="p-2 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white rounded-lg transition-all">
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <button onClick={() => fetchParticipants(event.id, event.title)} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-all">
                                                            <Users className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleEditEvent(event)} className="p-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded-lg transition-all">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteEvent(event.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all">
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
                                {/* ... Form fields (reused logic) ... */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Etkinlik Adı</label>
                                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" placeholder="Örn: Melek Mosso Konseri" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Kategori</label>
                                        <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-primary/50">
                                            {allSubCategories.map(sub => (<option key={sub.name} value={sub.name} className="bg-black">{sub.name} ({sub.parentName})</option>))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Tarih & Saat</label>
                                        <input type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none [color-scheme:dark]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Mekan / Konum</label>
                                    <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-300 flex justify-between items-center">Bilet Kategorileri <button type="button" onClick={() => setTicketTypes([...ticketTypes, { name: '', price: 0 }])} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus size={12} /> Kategori Ekle</button></label>
                                    {ticketTypes.map((ticket, index) => (
                                        <div key={index} className="flex gap-3 items-center">
                                            <input type="text" placeholder="Kategori Adı" value={ticket.name} onChange={(e) => handleTicketChange(index, 'name', e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" required />
                                            <input type="number" placeholder="Fiyat" value={ticket.price} onChange={(e) => handleTicketChange(index, 'price', Number(e.target.value))} className="w-24 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" required min="0" />
                                            {ticketTypes.length > 1 && (<button type="button" onClick={() => { const n = [...ticketTypes]; n.splice(index, 1); setTicketTypes(n); }} className="p-3 text-red-400 hover:bg-white/5 rounded-xl transition-colors"><Trash2 size={18} /></button>)}
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-3 bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
                                    <label className="text-sm font-medium text-gray-300">Satış Türü</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer group"><input type="radio" name="salesType" value="internal" checked={salesType === 'internal'} onChange={(e) => setSalesType(e.target.value as any)} className="accent-primary" /><span className="text-sm text-white">Site İçi</span></label>
                                        <label className="flex items-center gap-2 cursor-pointer group"><input type="radio" name="salesType" value="external" checked={salesType === 'external'} onChange={(e) => setSalesType(e.target.value as any)} className="accent-primary" /><span className="text-sm text-white">Dış Bağlantı</span></label>
                                    </div>
                                    {salesType === 'external' && (<input type="url" required value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="Link" className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white" />)}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Görsel</label>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-primary file:text-black hover:file:bg-primary/90" />
                                </div>
                                <button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl transition-all shadow-lg">{submitting ? 'İşleniyor...' : (editingId ? 'Güncelle' : 'Oluştur')}</button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'applications' && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            {applications.length === 0 ? <div className="p-8 text-center text-gray-500">Henüz başvuru yok.</div> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-black/20 text-gray-400 font-medium">
                                            <tr><th className="px-6 py-4">Topluluk Adı</th><th className="px-6 py-4">Başvuran</th><th className="px-6 py-4">Kategori</th><th className="px-6 py-4">Durum</th><th className="px-6 py-4 text-right">İşlemler</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {applications.filter(a => a.status === 'pending').map((app) => (
                                                <tr key={app.id} className="hover:bg-neutral-800 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-white">{app.name}</td>
                                                    <td className="px-6 py-4 text-gray-300"><div>{app.userName}</div><div className="text-xs text-gray-500">{app.userEmail}</div></td>
                                                    <td className="px-6 py-4 text-gray-300 capitalize">{app.category}</td>
                                                    <td className="px-6 py-4"><span className="px-2 py-1 rounded text-xs font-bold border bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Bekliyor</span></td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => handleUpdateStatus(app.id, 'approved')} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all"><Check className="w-4 h-4" /></button>
                                                            <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"><X className="w-4 h-4" /></button>
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

                    {activeTab === 'discounts' && (
                        <div className="space-y-6">
                            {discountFormVisible && (
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 animate-fadeIn">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Tag className="w-6 h-6 text-primary" /> Yeni İndirim Kodu Oluştur</h2>
                                    <form onSubmit={handleCreateDiscountCode} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className="text-sm font-medium text-gray-300 mb-1 block">Kod</label><input type="text" required value={discountFormData.code} onChange={(e) => setDiscountFormData({ ...discountFormData, code: e.target.value.toUpperCase() })} placeholder="YENIYIL2026" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white uppercase focus:outline-none focus:border-primary/50" /></div>
                                            <div><label className="text-sm font-medium text-gray-300 mb-1 block">İndirim Türü</label><select value={discountFormData.type} onChange={(e) => setDiscountFormData({ ...discountFormData, type: e.target.value as 'percentage' | 'fixed' })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"><option value="percentage">Yüzde (%)</option><option value="fixed">Sabit Tutar (₺)</option></select></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div><label className="text-sm font-medium text-gray-300 mb-1 block">{discountFormData.type === 'percentage' ? 'İndirim Yüzdesi (%)' : 'İndirim Tutarı (₺)'}</label><input type="number" required min="0" max={discountFormData.type === 'percentage' ? 100 : undefined} value={discountFormData.value} onChange={(e) => setDiscountFormData({ ...discountFormData, value: Number(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" /></div>
                                            <div><label className="text-sm font-medium text-gray-300 mb-1 block">Toplam Kullanım Limiti</label><input type="number" min="0" value={discountFormData.maxUsage} onChange={(e) => setDiscountFormData({ ...discountFormData, maxUsage: Number(e.target.value) })} placeholder="0 = Sınırsız" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" /></div>
                                            <div><label className="text-sm font-medium text-gray-300 mb-1 block">Kişi Başına Limit</label><input type="number" min="1" value={discountFormData.maxUsagePerUser} onChange={(e) => setDiscountFormData({ ...discountFormData, maxUsagePerUser: Number(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50" /></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className="text-sm font-medium text-gray-300 mb-1 block">Geçerlilik Başlangıcı</label><input type="datetime-local" required value={discountFormData.validFrom} onChange={(e) => setDiscountFormData({ ...discountFormData, validFrom: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 [color-scheme:dark]" /></div>
                                            <div><label className="text-sm font-medium text-gray-300 mb-1 block">Geçerlilik Bitişi</label><input type="datetime-local" required value={discountFormData.validUntil} onChange={(e) => setDiscountFormData({ ...discountFormData, validUntil: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 [color-scheme:dark]" /></div>
                                        </div>
                                        <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl transition-all">Kodu Oluştur</button>
                                    </form>
                                </div>
                            )}
                            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                {discountCodes.length === 0 ? <div className="p-8 text-center text-gray-500">Henüz indirim kodu oluşturulmamış.</div> : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-black/20 text-gray-400 font-medium"><tr><th className="px-6 py-4">Kod</th><th className="px-6 py-4">İndirim</th><th className="px-6 py-4">Kullanım</th><th className="px-6 py-4">Geçerlilik</th><th className="px-6 py-4">Durum</th><th className="px-6 py-4 text-right">İşlemler</th></tr></thead>
                                            <tbody className="divide-y divide-white/5">
                                                {discountCodes.map((code) => (
                                                    <tr key={code.id} className="hover:bg-neutral-800 transition-colors">
                                                        <td className="px-6 py-4"><div className="flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /><span className="font-bold text-white">{code.code}</span></div></td>
                                                        <td className="px-6 py-4 text-gray-300">{code.type === 'percentage' ? `%${code.value}` : `₺${code.value}`}</td>
                                                        <td className="px-6 py-4 text-gray-300">{code.usedCount} / {code.maxUsage === 0 ? '∞' : code.maxUsage}</td>
                                                        <td className="px-6 py-4 text-gray-400 text-xs">{new Date(code.validUntil).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4">{code.isActive ? <span className="px-2 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold">Aktif</span> : <span className="px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold">Pasif</span>}</td>
                                                        <td className="px-6 py-4 text-right flex justify-end gap-2"><button onClick={() => handleToggleCodeStatus(code.id, code.isActive)} className={`p-2 rounded-lg transition-all ${code.isActive ? 'bg-neutral-800 text-gray-400 hover:text-white' : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'}`}>{code.isActive ? <Trash2 className="w-4 h-4" /> : <Check className="w-4 h-4" />}</button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function SidebarButton({ active, icon, label, onClick, notification, count }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
        >
            {icon}
            {label}
            {notification && <span className="ml-auto w-2 h-2 rounded-full bg-red-500"></span>}
            {count > 0 && <span className="ml-auto text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">{count}</span>}
        </button>
    );
}
