"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, Ticket, TrendingUp, Calendar, DollarSign, Activity } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalEvents: 0,
        activeEvents: 0,
        totalUsers: 0,
        totalRevenue: 0,
        pendingApplications: 0,
        totalTicketsSold: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Events Stats
                const eventsSnap = await getDocs(collection(db, "events"));
                const totalEvents = eventsSnap.size;
                const activeEvents = eventsSnap.docs.filter(doc => new Date(doc.data().date) > new Date()).length;

                // Users Stats (This might be heavy for large DBs, usually handled by server functions)
                const usersSnap = await getDocs(collection(db, "users"));
                const totalUsers = usersSnap.size;

                // Applications Stats
                const appsQuery = query(collection(db, "club_applications"), where("status", "==", "pending"));
                const appsSnap = await getDocs(appsQuery);

                // Revenue & Ticket Stats (Mock calculation based on reservations for now as real payments are simulated)
                // In a real app, this would query a 'payments' or 'orders' collection
                let revenue = 0;
                let tickets = 0;

                // Fetch all reservations from all events (Optimized approach would be a dedicated stats collection)
                // For MVP/Demo: Iterating a few meaningful collections or using a counter document is better.
                // Here we will simulate revenue based on a sample or use a placeholder if too complex for client-side

                // Simulating revenue for demo purposes based on events count to avoid reading too many subcollections
                revenue = totalEvents * 1500 + totalUsers * 50;
                tickets = totalEvents * 20 + totalUsers * 2;

                setStats({
                    totalEvents,
                    activeEvents,
                    totalUsers,
                    totalRevenue: revenue,
                    pendingApplications: appsSnap.size,
                    totalTicketsSold: tickets
                });
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">İstatistikler yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="text-primary" />
                Genel Bakış
            </h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Toplam Gelir (Tahmini)"
                    value={`₺${stats.totalRevenue.toLocaleString()}`}
                    icon={<DollarSign className="w-6 h-6 text-green-500" />}
                    trend="+12%"
                    trendUp={true}
                />
                <StatCard
                    title="Satılan Bilet"
                    value={stats.totalTicketsSold.toLocaleString()}
                    icon={<Ticket className="w-6 h-6 text-yellow-500" />}
                    trend="+5%"
                    trendUp={true}
                />
                <StatCard
                    title="Kullanıcı Sayısı"
                    value={stats.totalUsers.toLocaleString()}
                    icon={<Users className="w-6 h-6 text-blue-500" />}
                    trend="+8%"
                    trendUp={true}
                />
                <StatCard
                    title="Aktif Etkinlikler"
                    value={stats.activeEvents.toString()}
                    subValue={`Toplam: ${stats.totalEvents}`}
                    icon={<Calendar className="w-6 h-6 text-purple-500" />}
                />
            </div>

            {/* Application Alert */}
            {stats.pendingApplications > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                        <span className="text-yellow-500 font-medium">
                            Onay bekleyen {stats.pendingApplications} yeni kulüp başvurusu var.
                        </span>
                    </div>
                    <button className="text-sm bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 px-3 py-1 rounded-lg transition-colors">
                        İncele
                    </button>
                </div>
            )}

            {/* Recent Activity / Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                        Satış Grafiği (Son 7 Gün)
                    </h3>
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                        {[40, 65, 30, 85, 50, 90, 75].map((h, i) => (
                            <div key={i} className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-lg transition-all relative group" style={{ height: `${h}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {h * 10}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
                        <span>Pzt</span><span>Sal</span><span>Çar</span><span>Per</span><span>Cum</span><span>Cmt</span><span>Paz</span>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Hızlı İşlemler</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-left transition-colors group">
                            <Calendar className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                            <div className="font-bold text-white">Yeni Etkinlik</div>
                            <div className="text-xs text-gray-400">Etkinlik oluştur</div>
                        </button>
                        <button className="p-4 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-left transition-colors group">
                            <Ticket className="w-6 h-6 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                            <div className="font-bold text-white">Kod Oluştur</div>
                            <div className="text-xs text-gray-400">İndirim tanımla</div>
                        </button>
                        <button className="p-4 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-left transition-colors group">
                            <Users className="w-6 h-6 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                            <div className="font-bold text-white">Kullanıcılar</div>
                            <div className="text-xs text-gray-400">Üye yönetimi</div>
                        </button>
                        <button className="p-4 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-left transition-colors group">
                            <Activity className="w-6 h-6 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                            <div className="font-bold text-white">Raporlar</div>
                            <div className="text-xs text-gray-400">Detaylı analiz</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, subValue, icon, trend, trendUp }: any) {
    return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
                    <div className="text-2xl font-bold text-white mt-1">{value}</div>
                    {subValue && <div className="text-xs text-gray-500 mt-1">{subValue}</div>}
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                    {icon}
                </div>
            </div>
            {trend && (
                <div className={`text-xs font-medium ${trendUp ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                    {trendUp ? '↑' : '↓'} {trend} <span className="text-gray-500 ml-1">geçen aya göre</span>
                </div>
            )}
        </div>
    );
}
