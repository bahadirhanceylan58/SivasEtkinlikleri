"use client";

import { Trash2, Plus, Calendar, Type, Users, Tag, Settings, CreditCard, Ticket, Shield, Check, X, Search, Edit2, Eye, Globe, MapPin, LayoutDashboard, QrCode, Menu, Archive, GraduationCap } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-neutral-900 animate-pulse rounded-xl flex items-center justify-center text-gray-500">Harita yükleniyor...</div>
});
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
import VenueEditor from '@/components/VenueEditor';
import SponsorManagement from '@/components/admin/SponsorManagement';
import { SeatingConfig } from '@/types/seating';
import { generateSeatsForEvent } from '@/lib/seatUtils';
import { logAudit } from '@/lib/auditLog';

interface Event {
    id: string;
    title: string;
    date: string;
    subCategory: string;
    location: string;
    imageUrl: string;
    ticketTypes: { name: string; price: number }[];
    salesType: 'internal' | 'external';
    externalUrl?: string;
    description?: string;
    coordinates?: { lat: number; lng: number; };
    status?: 'pending' | 'approved' | 'rejected';
}

interface Application {
    id: string;
    name: string;
    userName: string;
    userEmail: string;
    category: string;
    status: 'pending' | 'approved' | 'rejected';
    description: string;
    imageUrl: string;
    userId: string;
    email: string;
}

interface DiscountCode {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    usedCount: number;
    maxUsage: number;
    maxUsagePerUser: number;
    validUntil: string;
    isActive: boolean;
}

interface SidebarButtonProps {
    active: boolean;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    notification?: boolean;
    count?: number;
}

export default function AdminPage() {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'applications' | 'discounts' | 'users' | 'validator' | 'clubs' | 'sponsors' | 'courses' | 'archive'>('dashboard');
    const [eventViewMode, setEventViewMode] = useState<'list' | 'form'>('list');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobil menü durumu

    // Form States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number; } | null>(null);
    const [ticketTypes, setTicketTypes] = useState<{ name: string, price: number }[]>([{ name: 'Genel Giriş', price: 0 }]);
    const [salesType, setSalesType] = useState<'internal' | 'external' | 'free' | 'reservation'>('internal');
    const [externalUrl, setExternalUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Seating System States
    const [hasSeating, setHasSeating] = useState(false);

    // Approval System States
    const [eventFilter, setEventFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [clubFilter, setClubFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [seatingConfig, setSeatingConfig] = useState<SeatingConfig | null>(null);

    // Management State
    const [events, setEvents] = useState<Event[]>([]);
    const [archivedEvents, setArchivedEvents] = useState<Event[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Participants State (Simplified)
    const [participants, setParticipants] = useState<any[]>([]);
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
    const [selectedEventTitle, setSelectedEventTitle] = useState('');

    // Club Management State
    const [clubs, setClubs] = useState<any[]>([]);
    const [clubFormVisible, setClubFormVisible] = useState(false);
    const [clubFormData, setClubFormData] = useState({
        name: '',
        description: '',
        category: 'spor',
        email: '',
        imageUrl: '',
        memberCount: 0
    });

    // Discount Codes State
    const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
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

    // Courses State
    const [courses, setCourses] = useState<any[]>([]);
    const [courseFilter, setCourseFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');



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
        fetchClubs();
        fetchCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!loading) {
            if (!user || !isAdmin) {
                router.push('/');
            }
        }
    }, [user, loading, isAdmin, router]);

    const fetchEvents = async () => {
        const now = new Date();
        const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

        const querySnapshot = await getDocs(collection(db, "events"));
        const activeEventsList: Event[] = [];
        const archivedEventsList: Event[] = [];

        // Auto-archive and auto-delete logic
        for (const eventDoc of querySnapshot.docs) {
            const eventData = eventDoc.data();
            const event = { id: eventDoc.id, ...eventData } as Event;
            const eventDate = new Date(eventData.date);

            // Auto-delete: If archived for more than 1 month
            if (eventData.archived && eventData.archivedAt) {
                const archivedDate = new Date(eventData.archivedAt.seconds * 1000);
                if (archivedDate < oneMonthAgo) {
                    await deleteDoc(doc(db, "events", eventDoc.id));
                    continue; // Skip this event
                }
            }

            // Auto-archive: If date has passed and not already archived
            if (eventDate < now && !eventData.archived) {
                await updateDoc(doc(db, "events", eventDoc.id), {
                    archived: true,
                    archivedAt: new Date()
                });
                event.archived = true;
                event.archivedAt = new Date();
            }

            // Separate active and archived
            if (event.archived) {
                archivedEventsList.push(event);
            } else {
                activeEventsList.push(event);
            }
        }

        setEvents(activeEventsList);
        setArchivedEvents(archivedEventsList);
    };

    const handleArchiveEvent = async (eventId: string) => {
        if (confirm('Bu etkinliği arşivlemek istediğinize emin misiniz?')) {
            try {
                await updateDoc(doc(db, "events", eventId), {
                    archived: true,
                    archivedAt: new Date()
                });
                fetchEvents();
                alert('Etkinlik arşivlendi.');
            } catch (error) {
                console.error("Error archiving event:", error);
                alert('Arşivleme sırasında hata oluştu.');
            }
        }
    };

    const handleUnarchiveEvent = async (eventId: string) => {
        if (confirm('Bu etkinliği geri yüklemek istediğinize emin misiniz?')) {
            try {
                await updateDoc(doc(db, "events", eventId), {
                    archived: false,
                    archivedAt: null
                });
                fetchEvents();
                alert('Etkinlik geri yüklendi.');
            } catch (error) {
                console.error("Error unarchiving event:", error);
                alert('Geri yükleme sırasında hata oluştu.');
            }
        }
    };

    const fetchApplications = async () => {
        const querySnapshot = await getDocs(collection(db, "club_applications"));
        const appsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Application[];
        setApplications(appsList);
    };

    const fetchDiscountCodes = async () => {
        const querySnapshot = await getDocs(collection(db, "discountCodes"));
        const codesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DiscountCode[];
        setDiscountCodes(codesList);
    };

    const fetchClubs = async () => {
        const querySnapshot = await getDocs(collection(db, "clubs"));
        const clubsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClubs(clubsList);
    };

    const fetchCourses = async () => {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const coursesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCourses(coursesList);
    };

    const handleUpdateCourseStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await updateDoc(doc(db, "courses", id), {
                status: status,
                updatedAt: new Date(),
                reviewedBy: user?.uid || 'admin'
            });

            // Email bildirimi gönder
            // Email bildirimi devre dışı bırakıldı
            /*
            const course = courses.find(c => c.id === id);
            if (course && course.instructorEmail) {
                try {
                    await fetch('/api/email/course-approval', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userName: course.instructorName,
                            userEmail: course.instructorEmail,
                            courseTitle: course.title,
                            approved: status === 'approved',
                            message: status === 'approved'
                                ? 'Tebrikler! Kursunuz onaylandı ve yayına alındı.'
                                : 'Kurs başvurunuz incelendi ve şu an için onaylanamadı.'
                        }),
                    });
                } catch (emailError) {
                    console.error('Email gönderim hatası:', emailError);
                }
            }
            */

            alert(`Kurs ${status === 'approved' ? 'onaylandı' : 'reddedildi'}.`);
            fetchCourses();
        } catch (error) {
            console.error("Error:", error);
            alert("Hata oluştu.");
        }
    };

    const handleDeleteCourse = async (id: string) => {
        if (confirm('Bu kursu silmek istediğinize emin misiniz?')) {
            try {
                await deleteDoc(doc(db, "courses", id));
                fetchCourses();
                alert('Kurs silindi.');
            } catch (error) {
                console.error("Error deleting course:", error);
                alert('Silinirken hata oluştu.');
            }
        }
    };

    const handleCreateClub = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "clubs"), {
                ...clubFormData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            alert('Kulüp oluşturuldu!');
            setClubFormVisible(false);
            setClubFormData({
                name: '', description: '', category: 'spor', email: '', imageUrl: '', memberCount: 0
            });
            fetchClubs();
        } catch (error) {
            console.error("Error creating club:", error);
            alert('Kulüp oluşturulurken hata oluştu.');
        }
    };

    const handleDeleteClub = async (id: string) => {
        if (confirm('Bu kulübü silmek istediğinize emin misiniz?')) {
            try {
                await deleteDoc(doc(db, "clubs", id));
                fetchClubs();
                alert('Kulüp silindi.');
            } catch (error) {
                console.error("Error deleting club:", error);
                alert('Silinirken hata oluştu.');
            }
        }
    };

    const handleUpdateEventStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await updateDoc(doc(db, "events", id), {
                status: status,
                updatedAt: new Date()
            });
            alert(`Etkinlik ${status === 'approved' ? 'onaylandı' : 'reddedildi'}.`);
            fetchEvents();
        } catch (error) {
            console.error("Error:", error);
            alert("Hata oluştu.");
        }
    };

    const handleUpdateClubStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await updateDoc(doc(db, "clubs", id), {
                status: status,
                updatedAt: new Date()
            });
            alert(`Kulüp ${status === 'approved' ? 'onaylandı' : 'reddedildi'}.`);
            fetchClubs();
        } catch (error) {
            console.error("Error:", error);
            alert("Hata oluştu.");
        }
    };





    const handleDashboardNavigate = (tab: string, options?: any) => {
        setActiveTab(tab as any);
        setIsMobileMenuOpen(false); // Mobilde dashboard içinden navigasyon yapılırsa menüyü kapat
        if (tab === 'events' && options?.mode) {
            setEventViewMode(options.mode);
        }
        if (tab === 'discounts' && options?.openForm) {
            setDiscountFormVisible(true);
        }

        // Refresh data based on tab
        if (tab === 'events') fetchEvents();
        if (tab === 'applications') fetchApplications();
        if (tab === 'discounts') fetchDiscountCodes();
        if (tab === 'clubs') fetchClubs();
        if (tab === 'courses') fetchCourses();
        if (tab === 'users') {
            // User fetch logic if needed
        }
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

            const eventData: any = {
                title, description, category: selectedSub.parentId, subCategory: selectedSub.name, date,
                location, coordinates: coordinates?.lat && coordinates?.lng ? { lat: Number(coordinates.lat), lng: Number(coordinates.lng) } : null,
                imageUrl: finalImageUrl, ticketTypes, salesType,
                externalUrl: salesType === 'external' ? externalUrl : null,
                hasSeating,
                seatingConfig: hasSeating ? seatingConfig : null,
                updatedAt: new Date()
            };

            if (editingId) {
                // remove undefined fields
                Object.keys(eventData).forEach(key => eventData[key] === undefined && delete eventData[key]);
                await updateDoc(doc(db, "events", editingId), eventData);
                alert('Etkinlik güncellendi!');
            } else {
                eventData.status = 'pending'; // Yeni etkinlikler pending olarak başlar
                const docRef = await addDoc(collection(db, "events"), { ...eventData, createdAt: new Date() });

                // Generate seats if seating system is enabled
                if (hasSeating && seatingConfig) {
                    await generateSeatsForEvent(docRef.id, seatingConfig);
                }

                alert('Etkinlik oluşturuldu!');
            }
            setEventViewMode('list'); fetchEvents(); resetForm();
        } catch (error: any) {
            console.error("Error:", error);
            alert('Hata oluştu: ' + (error?.message || 'Bilinmeyen hata'));
        }
        finally { setSubmitting(false); }
    };

    const handleDeleteEvent = async (id: string) => {
        if (confirm('Bu etkinliği silmek istediğinize emin misiniz?')) {
            try { await deleteDoc(doc(db, "events", id)); fetchEvents(); alert('Silindi.'); }
            catch (error) { console.error("Error:", error); alert('Hata.'); }
        }
    };



    const handleEditEvent = (event: Event) => {
        setEditingId(event.id); setTitle(event.title); setDescription(event.description || ''); setSubCategory(event.subCategory || allSubCategories[0].name);
        setDate(event.date); setLocation(event.location); setCoordinates(event.coordinates || null); setTicketTypes(event.ticketTypes || [{ name: 'Standart', price: 0 }]);
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
        setEditingId(null); setTitle(''); setDescription(''); setSubCategory(allSubCategories[0]?.name || ''); setDate('');
        setLocation(''); setCoordinates(null); setTicketTypes([{ name: 'Genel Giriş', price: 0 }]); setSalesType('internal');
        setExternalUrl(''); setImageFile(null); setImageUrl('');
        setHasSeating(false); setSeatingConfig(null);
    };

    const handleTicketChange = (index: number, field: 'name' | 'price', value: any) => {
        const newTickets = [...ticketTypes];
        if (field === 'name') {
            newTickets[index].name = value as string;
        } else {
            newTickets[index].price = value as number;
        }
        setTicketTypes(newTickets);
    };

    // Sidebar Content Component (Reusable for Desktop & Mobile)
    const SidebarContent = () => (
        <>
            <div className="h-16 flex items-center px-6 border-b border-border">
                <Link href="/" className="text-xl font-heading font-bold tracking-tight hover:scale-105 transition-transform group flex items-center">
                    <span className="text-foreground transition-colors">Sivas</span>
                    <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent ml-1">Etkinlikleri</span>
                </Link>
                <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">Admin</span>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <SidebarButton
                    active={activeTab === 'dashboard'}
                    icon={<LayoutDashboard className="w-5 h-5" />}
                    label="Dashboard"
                    onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                />
                <SidebarButton
                    active={activeTab === 'events'}
                    icon={<Calendar className="w-5 h-5" />}
                    label="Etkinlik Yönetimi"
                    onClick={() => { setActiveTab('events'); setEventViewMode('list'); fetchEvents(); setIsMobileMenuOpen(false); }}
                />
                <SidebarButton
                    active={activeTab === 'applications'}
                    icon={<Users className="w-5 h-5" />}
                    label="Kulüp Başvuruları"
                    onClick={() => { setActiveTab('applications'); fetchApplications(); setIsMobileMenuOpen(false); }}
                    notification={applications.some(a => a.status === 'pending')}
                />
                <SidebarButton
                    active={activeTab === 'clubs'}
                    icon={<Users className="w-5 h-5" />}
                    label="Kulüp Yönetimi"
                    onClick={() => { setActiveTab('clubs'); fetchClubs(); setIsMobileMenuOpen(false); }}
                />
                <SidebarButton
                    active={activeTab === 'sponsors'}
                    icon={<CreditCard className="w-5 h-5" />}
                    label="Sponsorluklar"
                    onClick={() => { setActiveTab('sponsors'); setIsMobileMenuOpen(false); }}
                />
                <SidebarButton
                    active={activeTab === 'courses'}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>}
                    label="Kurs Başvuruları"
                    onClick={() => { setActiveTab('courses'); fetchCourses(); setIsMobileMenuOpen(false); }}
                    notification={courses.some(c => c.status === 'pending')}
                    count={courses.filter(c => c.status === 'pending').length}
                />
                <SidebarButton
                    active={false}
                    icon={<GraduationCap className="w-5 h-5" />}
                    label="Kurs Yönetimi"
                    onClick={() => router.push('/admin/kurslar')}
                />
                <SidebarButton
                    active={activeTab === 'discounts'}
                    icon={<Tag className="w-5 h-5" />}
                    label="İndirim Kodları"
                    onClick={() => { setActiveTab('discounts'); fetchDiscountCodes(); setIsMobileMenuOpen(false); }}
                    count={discountCodes.filter(c => c.isActive).length}
                />
                <SidebarButton
                    active={activeTab === 'users'}
                    icon={<Users className="w-5 h-5" />}
                    label="Kullanıcılar"
                    onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }}
                />
                <SidebarButton
                    active={activeTab === 'validator'}
                    icon={<QrCode className="w-5 h-5" />}
                    label="Bilet Doğrulama"
                    onClick={() => { setActiveTab('validator'); setIsMobileMenuOpen(false); }}
                />
                <SidebarButton
                    active={activeTab === 'archive'}
                    icon={<Archive className="w-5 h-5" />}
                    label="Arşiv"
                    onClick={() => { setActiveTab('archive'); fetchEvents(); setIsMobileMenuOpen(false); }}
                    count={archivedEvents.length}
                />
            </nav>

            <div className="p-4 border-t border-border space-y-1">
                <Link href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl font-medium transition-colors">
                    <Globe className="w-5 h-5" />
                    Siteyi Görüntüle
                </Link>
            </div>
        </>
    );

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-background flex text-foreground font-sans transition-colors duration-300">

            {/* Desktop Sidebar (Hidden on mobile) */}
            <aside className="w-64 border-r border-border hidden lg:flex flex-col bg-card/30">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar (Drawer) */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Dedicated Mobile Menu Button (Fixed Position) */}
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-[50] p-3 bg-card border border-border shadow-lg rounded-full text-foreground hover:bg-primary hover:text-black transition-all"
                aria-label="Menüyü Aç"
            >
                <Menu className="w-6 h-6" />
            </button>

            <aside className={`fixed inset-y-0 left-0 w-64 bg-background border-r border-border z-[100] transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-background transition-colors duration-300">
                <header className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 hover:bg-muted rounded-lg text-foreground transition-colors mr-2"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <h1 className="text-lg sm:text-xl font-bold capitalize text-foreground truncate">
                            {activeTab === 'dashboard' && 'Genel Bakış'}
                            {activeTab === 'events' && (eventViewMode === 'list' ? 'Etkinlik Listesi' : (editingId ? 'Etkinlik Düzenle' : 'Yeni Etkinlik'))}
                            {activeTab === 'applications' && 'Kulüp Başvuruları'}
                            {activeTab === 'clubs' && 'Kulüp Yönetimi'}
                            {activeTab === 'discounts' && 'İndirim Kodları'}
                            {activeTab === 'users' && 'Kullanıcı Yönetimi'}
                            {activeTab === 'validator' && 'Bilet Doğrulama'}
                            {activeTab === 'sponsors' && 'Sponsorluk Yönetimi'}
                            {activeTab === 'courses' && 'Kurs Başvuruları'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {activeTab === 'clubs' && (
                            <button onClick={() => setClubFormVisible(!clubFormVisible)} className="btn btn-sm bg-primary text-black hover:bg-primary-hover font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-2 transition-all hover:scale-105 text-xs sm:text-sm">
                                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{clubFormVisible ? 'İptal' : 'Yeni Kulüp'}</span>
                                <span className="sm:hidden">Yeni</span>
                            </button>
                        )}
                        {activeTab === 'events' && eventViewMode === 'list' && (
                            <button onClick={() => { resetForm(); setEventViewMode('form'); }} className="btn btn-sm bg-primary text-black hover:bg-primary-hover font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-2 transition-all hover:scale-105 text-xs sm:text-sm">
                                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Yeni Ekle</span>
                                <span className="sm:hidden">Ekle</span>
                            </button>
                        )}
                        {activeTab === 'discounts' && (
                            <button onClick={() => setDiscountFormVisible(!discountFormVisible)} className="btn btn-sm bg-primary text-black hover:bg-primary-hover font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-2 transition-all hover:scale-105 text-xs sm:text-sm">
                                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{discountFormVisible ? 'İptal' : 'Yeni Kod'}</span>
                                <span className="sm:hidden">Ekle</span>
                            </button>
                        )}
                        {activeTab === 'events' && eventViewMode === 'form' && (
                            <button onClick={() => { resetForm(); setEventViewMode('list'); }} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                                Listeye Dön
                            </button>
                        )}
                    </div>
                </header>

                <div className="p-4 sm:p-8 space-y-8">
                    {activeTab === 'dashboard' && (
                        <div>
                            <AdminDashboard onNavigate={handleDashboardNavigate} />
                        </div>
                    )}

                    {activeTab === 'users' && <UserManagement />}

                    {activeTab === 'validator' && <TicketValidator />}

                    {activeTab === 'sponsors' && <SponsorManagement />}

                    {activeTab === 'courses' && (
                        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-border bg-muted/30">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                                        Kurs Başvuruları
                                    </h2>
                                    <div className="flex gap-2 text-sm">
                                        <button onClick={() => setCourseFilter('all')} className={`px-3 py-1.5 rounded-lg transition-colors ${courseFilter === 'all' ? 'bg-primary text-black font-medium' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>Tümü ({courses.length})</button>
                                        <button onClick={() => setCourseFilter('pending')} className={`px-3 py-1.5 rounded-lg transition-colors ${courseFilter === 'pending' ? 'bg-yellow-500 text-black font-medium' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>Bekleyen ({courses.filter(c => c.status === 'pending').length})</button>
                                        <button onClick={() => setCourseFilter('approved')} className={`px-3 py-1.5 rounded-lg transition-colors ${courseFilter === 'approved' ? 'bg-green-500 text-black font-medium' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>Onaylandı ({courses.filter(c => c.status === 'approved').length})</button>
                                        <button onClick={() => setCourseFilter('rejected')} className={`px-3 py-1.5 rounded-lg transition-colors ${courseFilter === 'rejected' ? 'bg-red-500 text-white font-medium' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>Reddedildi ({courses.filter(c => c.status === 'rejected').length})</button>
                                    </div>
                                </div>
                            </div>
                            {courses.filter(c => courseFilter === 'all' || c.status === courseFilter).length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    {courseFilter === 'all' ? 'Henüz kurs başvurusu yok.' : `${courseFilter === 'pending' ? 'Bekleyen' : courseFilter === 'approved' ? 'Onaylandı' : 'Reddedilen'} kurs yok.`}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
                                            <tr>
                                                <th className="px-6 py-4">Kurs Adı</th>
                                                <th className="px-6 py-4">Eğitmen</th>
                                                <th className="px-6 py-4">Kategori</th>
                                                <th className="px-6 py-4">Durum</th>
                                                <th className="px-6 py-4">Başlangıç</th>
                                                <th className="px-6 py-4 text-right">İşlemler</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {courses.filter(c => courseFilter === 'all' || c.status === courseFilter).map((course) => (
                                                <tr key={course.id} className="hover:bg-neutral-50 dark:bg-zinc-900 transition-colors group">
                                                    <td className="px-6 py-4 font-medium text-foreground max-w-xs truncate">{course.title}</td>
                                                    <td className="px-6 py-4 text-muted-foreground">{course.instructorName}</td>
                                                    <td className="px-6 py-4 text-muted-foreground">{course.category}</td>
                                                    <td className="px-6 py-4">
                                                        {course.status === 'pending' && <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded-full font-medium">Bekliyor</span>}
                                                        {course.status === 'approved' && <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full font-medium">Onaylandı</span>}
                                                        {course.status === 'rejected' && <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs rounded-full font-medium">Reddedildi</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-muted-foreground text-xs">
                                                        {course.startDate ? new Date(course.startDate.seconds ? course.startDate.seconds * 1000 : course.startDate).toLocaleDateString('tr-TR') : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link href={`/kurslar/${course.id}`} target="_blank" className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-all" aria-label="Görüntüle">
                                                                <Eye className="w-4 h-4" />
                                                            </Link>
                                                            {course.status === 'pending' && (
                                                                <>
                                                                    <button onClick={() => handleUpdateCourseStatus(course.id, 'approved')} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all" aria-label="Onayla">
                                                                        <Check className="w-4 h-4" />
                                                                    </button>
                                                                    <button onClick={() => handleUpdateCourseStatus(course.id, 'rejected')} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" aria-label="Reddet">
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button onClick={() => handleDeleteCourse(course.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" aria-label="Sil">
                                                                <Trash2 className="w-4 h-4" />
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

                    {activeTab === 'archive' && (
                        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-border bg-muted/30">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <Archive className="w-5 h-5 text-primary" />
                                    Arşivlenmiş Etkinlikler
                                </h2>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Tarihi geçmiş etkinlikler otomatik olarak arşivlenir. Arşivlendikten 1 ay sonra otomatik silinir.
                                </p>
                            </div>
                            {archivedEvents.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">Arşivde etkinlik yok.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
                                            <tr>
                                                <th className="px-6 py-4">Etkinlik Adı</th>
                                                <th className="px-6 py-4">Tarih</th>
                                                <th className="px-6 py-4">Arşivlenme</th>
                                                <th className="px-6 py-4 text-right">İşlemler</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {archivedEvents.map((event) => (
                                                <tr key={event.id} className="hover:bg-neutral-50 dark:bg-zinc-900 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-foreground">{event.title}</td>
                                                    <td className="px-6 py-4 text-muted-foreground">{event.date?.toString().replace('T', ' ')}</td>
                                                    <td className="px-6 py-4 text-muted-foreground text-xs">
                                                        {event.archivedAt ?
                                                            new Date(event.archivedAt.seconds ? event.archivedAt.seconds * 1000 : event.archivedAt).toLocaleString('tr-TR')
                                                            : '-'
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link href={`/etkinlik/${event.id}`} target="_blank" className="p-2 bg-muted text-muted-foreground hover:bg-foreground hover:text-background rounded-lg transition-all" aria-label="Görüntüle">
                                                                <Eye className="w-4 h-4" />
                                                            </Link>
                                                            <button onClick={() => handleUnarchiveEvent(event.id)} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all" aria-label="Geri Yükle">
                                                                <Archive className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => handleDeleteEvent(event.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" aria-label="Kalıcı Sil">
                                                                <Trash2 className="w-4 h-4" />
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

                    {activeTab === 'events' && eventViewMode === 'list' && (
                        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
                                        <tr>
                                            <th className="px-6 py-4">Etkinlik Adı</th>
                                            <th className="px-6 py-4">Tarih</th>
                                            <th className="px-6 py-4">Kategori</th>
                                            <th className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    Durum
                                                    <select
                                                        value={eventFilter}
                                                        onChange={(e) => setEventFilter(e.target.value as any)}
                                                        className="bg-transparent border border-border rounded px-1 py-0.5 text-xs focus:outline-none"
                                                    >
                                                        <option value="all" className="bg-neutral-900">Tümü</option>
                                                        <option value="pending" className="bg-neutral-900">Bekleyen</option>
                                                        <option value="approved" className="bg-neutral-900">Onaylı</option>
                                                        <option value="rejected" className="bg-neutral-900">Red</option>
                                                    </select>
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-right">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {events.filter(e => eventFilter === 'all' || e.status === eventFilter).map((event) => (
                                            <tr key={event.id} className="hover:bg-neutral-50 dark:bg-zinc-900 transition-colors group">
                                                <td className="px-6 py-4 font-medium text-foreground">{event.title}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{event.date?.toString().replace('T', ' ')}</td>
                                                <td className="px-6 py-4 text-muted-foreground">{event.subCategory}</td>
                                                <td className="px-6 py-4">
                                                    {event.status === 'pending' && <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded-full font-medium">Bekliyor</span>}
                                                    {event.status === 'approved' && <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full font-medium">Onaylı</span>}
                                                    {event.status === 'rejected' && <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs rounded-full font-medium">Red</span>}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link href={`/etkinlik/${event.id}`} target="_blank" className="p-2 bg-muted text-muted-foreground hover:bg-foreground hover:text-background rounded-lg transition-all" aria-label="Görüntüle">
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        {event.status === 'pending' && (
                                                            <>
                                                                <button onClick={() => handleUpdateEventStatus(event.id, 'approved')} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all" aria-label="Onayla">
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => handleUpdateEventStatus(event.id, 'rejected')} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" aria-label="Reddet">
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button onClick={() => fetchParticipants(event.id, event.title)} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-all" aria-label="Katılımcılar">
                                                            <Users className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleEditEvent(event)} className="p-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded-lg transition-all" aria-label="Düzenle">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteEvent(event.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" aria-label="Sil">
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
                            <form onSubmit={handleCreateOrUpdateEvent} className="bg-card border border-border rounded-2xl p-8 space-y-6 shadow-sm">
                                {/* ... Form fields (reused logic) ... */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Etkinlik Adı</label>
                                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground" placeholder="Örn: Melek Mosso Konseri" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Açıklama / Detaylar</label>
                                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground" placeholder="Etkinlik hakkında detaylı bilgi, kurallar, sanatçı bilgisi vb." />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Kategori</label>
                                        <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground appearance-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all">
                                            {allSubCategories.map(sub => (<option key={sub.name} value={sub.name} className="bg-card text-foreground">{sub.name} ({sub.parentName})</option>))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Tarih & Saat</label>
                                        <input type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl p-3 text-foreground focus:ring-1 focus:ring-primary/50 focus:border-primary/50 focus:outline-none transition-all [color-scheme:dark] dark:[color-scheme:dark] light:[color-scheme:light]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Mekan / Konum</label>
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-6" />
                                                <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground" placeholder="Mekan adı veya adresi girin" />
                                            </div>
                                        </div>

                                        <div className="bg-muted/30 border border-border p-1 rounded-xl">
                                            <p className="text-xs text-muted-foreground mb-2 px-2 pt-1 font-medium">Haritadan konum seçin:</p>
                                            <MapPicker position={coordinates} setPosition={setCoordinates} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-foreground flex justify-between items-center">
                                        {salesType === 'free' ? 'Etkinlik Kategorileri' : 'Bilet Kategorileri'}
                                        {salesType !== 'free' && (
                                            <button type="button" onClick={() => setTicketTypes([...ticketTypes, { name: '', price: 0 }])} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus size={12} /> Kategori Ekle</button>
                                        )}
                                    </label>
                                    {salesType === 'free' ? (
                                        <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg border border-border">
                                            Bu ücretsiz bir etkinliktir. Katılımcılar herhangi bir ücret ödemeden katılabilir.
                                        </p>
                                    ) : (
                                        <>
                                            {ticketTypes.map((ticket, index) => (
                                                <div key={index} className="flex gap-3 items-center">
                                                    <input type="text" placeholder="Kategori Adı" value={ticket.name} onChange={(e) => handleTicketChange(index, 'name', e.target.value)} className="flex-1 bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground" required />
                                                    {salesType !== 'reservation' && (
                                                        <input type="number" placeholder="Fiyat" value={ticket.price} onChange={(e) => handleTicketChange(index, 'price', Number(e.target.value))} className="w-24 bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" required min="0" />
                                                    )}
                                                    {salesType === 'reservation' && (
                                                        <input type="number" placeholder="Kapasite" value={ticket.price} onChange={(e) => handleTicketChange(index, 'price', Number(e.target.value))} className="w-24 bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" required min="1" />
                                                    )}
                                                    {ticketTypes.length > 1 && (<button type="button" onClick={() => { const n = [...ticketTypes]; n.splice(index, 1); setTicketTypes(n); }} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors" aria-label="Sil"><Trash2 size={18} /></button>)}
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                                <div className="space-y-3 bg-muted/30 border border-border p-4 rounded-xl">
                                    <label className="text-sm font-medium text-foreground">Bilet Türü</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="flex items-center gap-2 cursor-pointer group p-3 border border-border rounded-lg hover:border-primary transition-colors bg-card">
                                            <input type="radio" name="salesType" value="internal" checked={salesType === 'internal'} onChange={(e) => setSalesType(e.target.value as any)} className="accent-primary" />
                                            <div>
                                                <span className="text-sm font-medium text-foreground">Site İçi Satış</span>
                                                <p className="text-xs text-muted-foreground">Standart bilet satışı</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group p-3 border border-border rounded-lg hover:border-primary transition-colors bg-card">
                                            <input type="radio" name="salesType" value="external" checked={salesType === 'external'} onChange={(e) => setSalesType(e.target.value as any)} className="accent-primary" />
                                            <div>
                                                <span className="text-sm font-medium text-foreground">Dış Bağlantı</span>
                                                <p className="text-xs text-muted-foreground">Biletix, Passo vb.</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group p-3 border border-border rounded-lg hover:border-primary transition-colors bg-card">
                                            <input type="radio" name="salesType" value="free" checked={salesType === 'free'} onChange={(e) => setSalesType(e.target.value as any)} className="accent-primary" />
                                            <div>
                                                <span className="text-sm font-medium text-foreground">Ücretsiz</span>
                                                <p className="text-xs text-muted-foreground">Bilet fiyatı yok</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group p-3 border border-border rounded-lg hover:border-primary transition-colors bg-card">
                                            <input type="radio" name="salesType" value="reservation" checked={salesType === 'reservation'} onChange={(e) => setSalesType(e.target.value as any)} className="accent-primary" />
                                            <div>
                                                <span className="text-sm font-medium text-foreground">Rezervasyon</span>
                                                <p className="text-xs text-muted-foreground">Rezervasyon butonu</p>
                                            </div>
                                        </label>
                                    </div>
                                    {salesType === 'external' && (<input type="url" required value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="Dış bilet sitesi linki (örn: https://www.biletix.com/...)" className="w-full mt-3 bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground" />)}
                                </div>

                                {/* Seating System Toggle */}
                                <div className="space-y-3 bg-muted/30 border border-border p-4 rounded-xl">
                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <div>
                                            <span className="text-sm font-medium text-foreground">💺 Koltuk Seçimi Sistemi</span>
                                            <p className="text-xs text-muted-foreground mt-1">Etkinlik için salon koltuk düzeni oluştur</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={hasSeating}
                                            onChange={(e) => setHasSeating(e.target.checked)}
                                            className="w-5 h-5 accent-primary cursor-pointer"
                                        />
                                    </label>

                                    {hasSeating && (
                                        <div className="mt-4 pt-4 border-t border-border">
                                            <VenueEditor
                                                config={seatingConfig}
                                                onChange={setSeatingConfig}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Görsel</label>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-primary file:text-black hover:file:bg-primary-hover file:cursor-pointer file:border-0 file:font-semibold" />
                                </div>
                                <button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.01]">{submitting ? 'İşleniyor...' : (editingId ? 'Güncelle' : 'Oluştur')}</button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'applications' && (
                        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                            {applications.length === 0 ? <div className="p-8 text-center text-muted-foreground">Henüz başvuru yok.</div> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
                                            <tr><th className="px-6 py-4">Topluluk Adı</th><th className="px-6 py-4">Başvuran</th><th className="px-6 py-4">Kategori</th><th className="px-6 py-4">Durum</th><th className="px-6 py-4 text-right">İşlemler</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {applications.filter(a => a.status === 'pending').map((app) => (
                                                <tr key={app.id} className="hover:bg-neutral-50 dark:bg-zinc-900 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-foreground">{app.name}</td>
                                                    <td className="px-6 py-4 text-muted-foreground"><div>{app.userName}</div><div className="text-xs text-muted-foreground/80">{app.userEmail}</div></td>
                                                    <td className="px-6 py-4 text-muted-foreground capitalize">{app.category}</td>
                                                    <td className="px-6 py-4"><span className="px-2 py-1 rounded text-xs font-bold border bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Bekliyor</span></td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => handleUpdateStatus(app.id, 'approved')} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all" aria-label="Onayla"><Check className="w-4 h-4" /></button>
                                                            <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" aria-label="Reddet"><X className="w-4 h-4" /></button>
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

                    {activeTab === 'clubs' && (
                        <div className="space-y-6">
                            {clubFormVisible && (
                                <div className="bg-card border border-border rounded-2xl p-8 animate-fadeIn shadow-sm">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground"><Users className="w-6 h-6 text-primary" /> Yeni Kulüp Oluştur</h2>
                                    <form onSubmit={handleCreateClub} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-foreground mb-1 block">Kulüp Adı</label>
                                                <input type="text" required value={clubFormData.name} onChange={(e) => setClubFormData({ ...clubFormData, name: e.target.value })} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" placeholder="Örn: Tiyatro Kulübü" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-foreground mb-1 block">Kategori</label>
                                                <select value={clubFormData.category} onChange={(e) => setClubFormData({ ...clubFormData, category: e.target.value })} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50">
                                                    <option value="spor" className="bg-card">Spor</option>
                                                    <option value="sanat" className="bg-card">Sanat</option>
                                                    <option value="teknoloji" className="bg-card">Teknoloji</option>
                                                    <option value="sosyal" className="bg-card">Sosyal</option>
                                                    <option value="akademik" className="bg-card">Akademik</option>
                                                    <option value="müzik" className="bg-card">Müzik</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-1 block">Açıklama</label>
                                            <textarea required value={clubFormData.description} onChange={(e) => setClubFormData({ ...clubFormData, description: e.target.value })} rows={3} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" placeholder="Kulüp hakkında kısa açıklama..." />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-foreground mb-1 block">İletişim Email</label>
                                                <input type="email" required value={clubFormData.email} onChange={(e) => setClubFormData({ ...clubFormData, email: e.target.value })} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-foreground mb-1 block">Logo URL (Opsiyonel)</label>
                                                <input type="url" value={clubFormData.imageUrl} onChange={(e) => setClubFormData({ ...clubFormData, imageUrl: e.target.value })} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" placeholder="https://..." />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl transition-all">Kulübü Oluştur</button>
                                    </form>
                                </div>
                            )}
                            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                {clubs.length === 0 ? <div className="p-8 text-center text-muted-foreground">Henüz hiç kulüp yok.</div> : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
                                                <tr>
                                                    <th className="px-6 py-4">Kulüp Adı</th>
                                                    <th className="px-6 py-4">Kategori</th>
                                                    <th className="px-6 py-4">Üye Sayısı</th>
                                                    <th className="px-6 py-4">Admin Email</th>
                                                    <th className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            Durum
                                                            <select
                                                                value={clubFilter}
                                                                onChange={(e) => setClubFilter(e.target.value as any)}
                                                                className="bg-transparent border border-border rounded px-1 py-0.5 text-xs focus:outline-none"
                                                            >
                                                                <option value="all" className="bg-neutral-900">Tümü</option>
                                                                <option value="pending" className="bg-neutral-900">Bekleyen</option>
                                                                <option value="approved" className="bg-neutral-900">Onaylı</option>
                                                                <option value="rejected" className="bg-neutral-900">Red</option>
                                                            </select>
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-4 text-right">İşlemler</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {clubs.filter(c => clubFilter === 'all' || c.status === clubFilter).map((club) => (
                                                    <tr key={club.id} className="hover:bg-neutral-50 dark:bg-zinc-900 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-foreground">{club.name}</td>
                                                        <td className="px-6 py-4 text-muted-foreground capitalize">{club.category}</td>
                                                        <td className="px-6 py-4 text-muted-foreground">{club.memberCount || 0}</td>
                                                        <td className="px-6 py-4 text-muted-foreground">{club.email}</td>
                                                        <td className="px-6 py-4">
                                                            {club.status === 'pending' && <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded-full font-medium">Bekliyor</span>}
                                                            {club.status === 'approved' && <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full font-medium">Onaylı</span>}
                                                            {club.status === 'rejected' && <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs rounded-full font-medium">Red</span>}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                {club.status === 'pending' && (
                                                                    <>
                                                                        <button onClick={() => handleUpdateClubStatus(club.id, 'approved')} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all" aria-label="Onayla">
                                                                            <Check className="w-4 h-4" />
                                                                        </button>
                                                                        <button onClick={() => handleUpdateClubStatus(club.id, 'rejected')} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" aria-label="Reddet">
                                                                            <X className="w-4 h-4" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                                <button onClick={() => handleDeleteClub(club.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" aria-label="Sil">
                                                                    <Trash2 className="w-4 h-4" />
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
                        </div>
                    )}

                    {activeTab === 'discounts' && (
                        <div className="space-y-6">
                            {discountFormVisible && (
                                <div className="bg-card border border-border rounded-2xl p-8 animate-fadeIn shadow-sm">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground"><Tag className="w-6 h-6 text-primary" /> Yeni İndirim Kodu Oluştur</h2>
                                    <form onSubmit={handleCreateDiscountCode} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className="text-sm font-medium text-foreground mb-1 block">Kod</label><input type="text" required value={discountFormData.code} onChange={(e) => setDiscountFormData({ ...discountFormData, code: e.target.value.toUpperCase() })} placeholder="YENIYIL2026" className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground uppercase focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" /></div>
                                            <div><label className="text-sm font-medium text-foreground mb-1 block">İndirim Türü</label><select value={discountFormData.type} onChange={(e) => setDiscountFormData({ ...discountFormData, type: e.target.value as 'percentage' | 'fixed' })} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"><option value="percentage" className="bg-card">Yüzde (%)</option><option value="fixed" className="bg-card">Sabit Tutar (₺)</option></select></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div><label className="text-sm font-medium text-foreground mb-1 block">{discountFormData.type === 'percentage' ? 'İndirim Yüzdesi (%)' : 'İndirim Tutarı (₺)'}</label><input type="number" required min="0" max={discountFormData.type === 'percentage' ? 100 : undefined} value={discountFormData.value} onChange={(e) => setDiscountFormData({ ...discountFormData, value: Number(e.target.value) })} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" /></div>
                                            <div><label className="text-sm font-medium text-foreground mb-1 block">Toplam Kullanım Limiti</label><input type="number" min="0" value={discountFormData.maxUsage} onChange={(e) => setDiscountFormData({ ...discountFormData, maxUsage: Number(e.target.value) })} placeholder="0 = Sınırsız" className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" /></div>
                                            <div><label className="text-sm font-medium text-foreground mb-1 block">Kişi Başına Limit</label><input type="number" min="1" value={discountFormData.maxUsagePerUser} onChange={(e) => setDiscountFormData({ ...discountFormData, maxUsagePerUser: Number(e.target.value) })} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50" /></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className="text-sm font-medium text-foreground mb-1 block">Geçerlilik Başlangıcı</label><input type="datetime-local" required value={discountFormData.validFrom} onChange={(e) => setDiscountFormData({ ...discountFormData, validFrom: e.target.value })} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 [color-scheme:dark] dark:[color-scheme:dark] light:[color-scheme:light]" /></div>
                                            <div><label className="text-sm font-medium text-foreground mb-1 block">Geçerlilik Bitişi</label><input type="datetime-local" required value={discountFormData.validUntil} onChange={(e) => setDiscountFormData({ ...discountFormData, validUntil: e.target.value })} className="w-full bg-neutral-50 dark:bg-zinc-900 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 [color-scheme:dark] dark:[color-scheme:dark] light:[color-scheme:light]" /></div>
                                        </div>
                                        <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl transition-all">Kodu Oluştur</button>
                                    </form>
                                </div>
                            )}
                            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                {discountCodes.length === 0 ? <div className="p-8 text-center text-muted-foreground">Henüz indirim kodu oluşturulmamış.</div> : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-muted text-muted-foreground font-medium border-b border-border"><tr><th className="px-6 py-4">Kod</th><th className="px-6 py-4">İndirim</th><th className="px-6 py-4">Kullanım</th><th className="px-6 py-4">Geçerlilik</th><th className="px-6 py-4">Durum</th><th className="px-6 py-4 text-right">İşlemler</th></tr></thead>
                                            <tbody className="divide-y divide-border">
                                                {discountCodes.map((code) => (
                                                    <tr key={code.id} className="hover:bg-neutral-50 dark:bg-zinc-900 transition-colors">
                                                        <td className="px-6 py-4"><div className="flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /><span className="font-bold text-foreground">{code.code}</span></div></td>
                                                        <td className="px-6 py-4 text-muted-foreground">{code.type === 'percentage' ? `%${code.value}` : `₺${code.value}`}</td>
                                                        <td className="px-6 py-4 text-muted-foreground">{code.usedCount} / {code.maxUsage === 0 ? '∞' : code.maxUsage}</td>
                                                        <td className="px-6 py-4 text-muted-foreground text-xs">{new Date(code.validUntil).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4">{code.isActive ? <span className="px-2 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold">Aktif</span> : <span className="px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold">Pasif</span>}</td>
                                                        <td className="px-6 py-4 text-right flex justify-end gap-2"><button onClick={() => handleToggleCodeStatus(code.id, code.isActive)} className={`p-2 rounded-lg transition-all ${code.isActive ? 'bg-muted text-muted-foreground hover:text-foreground' : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'}`} aria-label="Durum Değiştir">{code.isActive ? <Trash2 className="w-4 h-4" /> : <Check className="w-4 h-4" />}</button></td>
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

function SidebarButton({ active, icon, label, onClick, notification, count }: SidebarButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
        >
            {icon}
            {label}
            {notification && <span className="ml-auto w-2 h-2 rounded-full bg-red-500"></span>}
            {count && count > 0 ? <span className="ml-auto text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded">{count}</span> : null}
        </button>
    );
}