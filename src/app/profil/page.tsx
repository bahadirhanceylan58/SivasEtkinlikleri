'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Ticket, FileText, MapPin, LogOut } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { QRCodeSVG } from 'qrcode.react';

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'tickets' | 'applications'>('tickets');
    const [tickets, setTickets] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchUserData();
        }
    }, [user, authLoading, router]);

    const fetchUserData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch Tickets
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && userDoc.data().tickets) {
                setTickets(userDoc.data().tickets.reverse());
            }

            // Fetch Applications
            const q = query(collection(db, 'club_applications'), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const apps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setApplications(apps);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || (loading && user)) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />
            <div className="flex-1 container mx-auto px-4 py-8">

                {/* Profile Header */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-3xl">
                        {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User size={40} />}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-2xl font-bold mb-1">{user?.displayName || 'Kullanıcı'}</h1>
                        <p className="text-gray-400">{user?.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-yellow-500 border border-yellow-500/20">
                            Standart Üye
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-800 mb-8">
                    <button
                        onClick={() => setActiveTab('tickets')}
                        className={`px-6 py-4 font-bold transition-all relative ${activeTab === 'tickets' ? 'text-yellow-500' : 'text-gray-400 hover:text-white'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Ticket size={20} />
                            Biletlerim
                        </div>
                        {activeTab === 'tickets' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`px-6 py-4 font-bold transition-all relative ${activeTab === 'applications' ? 'text-yellow-500' : 'text-gray-400 hover:text-white'}`}
                    >
                        <div className="flex items-center gap-2">
                            <FileText size={20} />
                            Başvurularım
                        </div>
                        {activeTab === 'applications' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"></div>}
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'tickets' && (
                    <div className="space-y-4 max-w-4xl">
                        {tickets.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">Henüz biletiniz yok.</div>
                        ) : (
                            tickets.map((ticket, index) => (
                                <div key={index} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row gap-6 hover:border-yellow-500/50 transition-all">
                                    <div className="bg-neutral-800 rounded-lg w-full md:w-32 flex flex-col items-center justify-center p-4">
                                        <span className="text-2xl font-bold text-yellow-500">{new Date(ticket.eventDate).getDate()}</span>
                                        <span className="text-sm uppercase text-gray-400">{new Date(ticket.eventDate).toLocaleDateString('tr-TR', { month: 'short' })}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-xl mb-2">{ticket.eventTitle}</h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                            <div className="flex items-center"><MapPin size={16} className="mr-1 text-yellow-500" /> {ticket.eventLocation}</div>
                                            <div className="flex items-center"><Ticket size={16} className="mr-1 text-yellow-500" /> {ticket.ticketCount} Adet</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center bg-white p-2 rounded-lg">
                                        <QRCodeSVG value={ticket.qrCode} size={60} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div className="space-y-4 max-w-4xl">
                        {applications.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="mb-4">Henüz bir başvurunuz yok.</p>
                                <button onClick={() => router.push('/kulup-basvuru')} className="text-yellow-500 hover:underline">
                                    Topluluk Oluşturmak İçin Başvur
                                </button>
                            </div>
                        ) : (
                            applications.map((app) => (
                                <div key={app.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{app.name}</h3>
                                        <p className="text-sm text-gray-400 mb-2">{app.category}</p>
                                        <span className={`text-xs px-2 py-1 rounded font-medium border ${app.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                app.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    'bg-red-500/10 text-red-500 border-red-500/20'
                                            }`}>
                                            {app.status === 'pending' ? 'Değerlendirmede' :
                                                app.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                                        </span>
                                    </div>
                                    <div className="text-right text-xs text-gray-500">
                                        {app.createdAt ? new Date(app.createdAt.seconds * 1000).toLocaleDateString('tr-TR') : '-'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

            </div>
            <Footer />
        </div>
    );
}
