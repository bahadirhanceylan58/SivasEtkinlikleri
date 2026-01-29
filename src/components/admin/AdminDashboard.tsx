"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, Ticket, TrendingUp, Calendar, DollarSign, Activity } from 'lucide-react';

interface AdminDashboardProps {
    onNavigate?: (tab: string, options?: any) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
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

                // Revenue & Ticket Stats
                // Note: For a real production app with many events, use a dedicated 'stats' document updated by Cloud Functions.
                // For now we will show 0 or calculate from available data if feasible without heavy reads.
                let revenue = 0;
                let tickets = 0;

                // Optional: If we want to exact count, we would need to query all reservations which is heavy.
                // Keeping as 0 until sales start flowing or stats aggregation is implemented.

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
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Activity className="text-primary" />
                Genel Bakış
            </h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Toplam Gelir (Tahmini)"
                    value={`₺${stats.totalRevenue.toLocaleString()}`}
                    icon={<DollarSign className="w-6 h-6 text-green-500" />}
                />
                <StatCard
                    title="Satılan Bilet"
                    value={stats.totalTicketsSold.toLocaleString()}
                    icon={<Ticket className="w-6 h-6 text-yellow-500" />}
                />
                <StatCard
                    title="Kullanıcı Sayısı"
                    value={stats.totalUsers.toLocaleString()}
                    icon={<Users className="w-6 h-6 text-blue-500" />}
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
                        <span className="text-yellow-600 dark:text-yellow-500 font-medium">
                            Onay bekleyen {stats.pendingApplications} yeni kulüp başvurusu var.
                        </span>
                    </div>
                    <button
                        onClick={() => onNavigate?.('applications')}
                        className="text-sm bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-600 dark:text-yellow-500 px-3 py-1 rounded-lg transition-colors"
                    >
                        İncele
                    </button>
                </div>
            )}

            {/* Recent Activity / Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-muted-foreground" />
                        Satış Grafiği (Son 7 Gün)
                    </h3>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <Activity className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">Grafik verileri yükleniyor...</p>
                            <p className="text-xs mt-1 opacity-60">Gerçek satış verileri yakında eklenecek</p>
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2 px-2">
                        <span>Pzt</span><span>Sal</span><span>Çar</span><span>Per</span><span>Cum</span><span>Cmt</span><span>Paz</span>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-foreground mb-4">Hızlı İşlemler</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => onNavigate?.('events', { mode: 'form' })}
                            className="p-4 bg-muted hover:bg-muted/80 border border-border rounded-xl text-left transition-colors group"
                        >
                            <Calendar className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                            <div className="font-bold text-foreground">Yeni Etkinlik</div>
                            <div className="text-xs text-muted-foreground">Etkinlik oluştur</div>
                        </button>
                        <button
                            onClick={() => onNavigate?.('discounts', { openForm: true })}
                            className="p-4 bg-muted hover:bg-muted/80 border border-border rounded-xl text-left transition-colors group"
                        >
                            <Ticket className="w-6 h-6 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                            <div className="font-bold text-foreground">Kod Oluştur</div>
                            <div className="text-xs text-muted-foreground">İndirim tanımla</div>
                        </button>
                        <button
                            onClick={() => onNavigate?.('users')}
                            className="p-4 bg-muted hover:bg-muted/80 border border-border rounded-xl text-left transition-colors group"
                        >
                            <Users className="w-6 h-6 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                            <div className="font-bold text-foreground">Kullanıcılar</div>
                            <div className="text-xs text-muted-foreground">Üye yönetimi</div>
                        </button>
                        <button
                            onClick={() => onNavigate?.('clubs')}
                            className="p-4 bg-muted hover:bg-muted/80 border border-border rounded-xl text-left transition-colors group"
                        >
                            <Users className="w-6 h-6 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                            <div className="font-bold text-foreground">Yeni Kulüp</div>
                            <div className="text-xs text-muted-foreground">Kulüp ekle</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, subValue, icon, trend, trendUp }: any) {
    return (
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-neutral-600 dark:text-neutral-400 text-sm font-medium">{title}</h3>
                    <div className="text-2xl font-bold text-foreground mt-1">{value}</div>
                    {subValue && <div className="text-xs text-muted-foreground mt-1">{subValue}</div>}
                </div>
                <div className="p-3 bg-muted rounded-xl">
                    {icon}
                </div>
            </div>
            {trend && (
                <div className={`text-xs font-medium ${trendUp ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                    {trendUp ? '↑' : '↓'} {trend} <span className="text-muted-foreground ml-1">geçen aya göre</span>
                </div>
            )}
        </div>
    );
}
