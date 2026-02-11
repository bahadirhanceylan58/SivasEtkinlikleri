"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, collectionGroup, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, Ticket, TrendingUp, Calendar, DollarSign, Activity, Eye, BookOpen } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminDashboardProps {
    onNavigate?: (tab: string, options?: any) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalCourses: 0,
        activeEvents: 0,
        totalUsers: 0,
        totalRevenue: 0,
        pendingApplications: 0
    });
    const [viewStats, setViewStats] = useState<any[]>([]);
    const [popularContent, setPopularContent] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Events Stats
                const eventsSnap = await getDocs(collection(db, "events"));
                const totalEvents = eventsSnap.size;
                const activeEvents = eventsSnap.docs.filter(doc => new Date(doc.data().date) > new Date()).length;

                // 2. Courses Stats
                const coursesSnap = await getDocs(collection(db, "courses"));
                const totalCourses = coursesSnap.size;

                // 3. Users Stats
                const usersSnap = await getDocs(collection(db, "users"));
                const totalUsers = usersSnap.size;

                // 4. View Stats (Last 7 Days)
                const statsQuery = query(collection(db, "stats"), orderBy("date", "desc"), limit(7));
                const statsSnap = await getDocs(statsQuery);
                const statsData = statsSnap.docs.map(doc => ({
                    name: new Date(doc.data().date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
                    views: doc.data().totalViews || 0,
                    date: doc.data().date
                })).reverse();
                setViewStats(statsData);

                // 5. Popular Content (Events & Courses)
                const allContent = [
                    ...eventsSnap.docs.map(d => ({ id: d.id, type: 'Etkinlik', ...d.data() })),
                    ...coursesSnap.docs.map(d => ({ id: d.id, type: 'Kurs', ...d.data() }))
                ];

                const sortedPopular = allContent
                    .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
                    .slice(0, 5);
                setPopularContent(sortedPopular);

                // 6. Real Revenue Calculation
                let realRevenue = 0;
                try {
                    // Note: This might require a Firestore Index for 'reservations' collection group
                    const revenueQuery = query(collectionGroup(db, 'reservations'), where('paymentStatus', '==', 'paid'));
                    const revenueSnap = await getDocs(revenueQuery);
                    realRevenue = revenueSnap.docs.reduce((acc, doc) => acc + (Number((doc.data() as any).totalAmount) || 0), 0);
                } catch (error) {
                    console.warn("Revenue calculation failed (likely missing index):", error);
                    // Fallback to 0 if index is missing to prevent crash
                    realRevenue = 0;
                }

                setStats({
                    totalEvents,
                    totalCourses,
                    activeEvents,
                    totalUsers,
                    totalRevenue: realRevenue,
                    pendingApplications: 0
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
                    title="Toplam Kullanıcı"
                    value={stats.totalUsers.toLocaleString()}
                    icon={<Users className="w-6 h-6 text-blue-500" />}
                />
                <StatCard
                    title="Aktif Etkinlikler"
                    value={stats.activeEvents.toString()}
                    subValue={`Toplam: ${stats.totalEvents}`}
                    icon={<Calendar className="w-6 h-6 text-purple-500" />}
                />
                <StatCard
                    title="Toplam Kurslar"
                    value={stats.totalCourses.toString()}
                    icon={<BookOpen className="w-6 h-6 text-orange-500" />}
                />
            </div>

            {/* Charts & Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Line Chart */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        Görüntülenme (Son 7 Gün)
                    </h3>
                    <div className="h-64 w-full">
                        {viewStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={viewStats}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888"
                                        tick={{ fill: '#888' }}
                                    />
                                    <YAxis
                                        stroke="#888"
                                        tick={{ fill: '#888' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                        labelStyle={{ color: '#fff' }}
                                        itemStyle={{ color: '#10b981' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="views"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ fill: '#10b981', r: 4 }}
                                        activeDot={{ r: 6, stroke: '#fff' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                Veri yok
                            </div>
                        )}
                    </div>
                </div>

                {/* Popular Content */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-yellow-500" />
                        🔥 En Popüler İçerikler
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Başlık</th>
                                    <th className="px-4 py-3">Tip</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">Görüntülenme</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {popularContent.map((item) => (
                                    <tr key={item.id} className="group hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-foreground truncate max-w-[150px]">
                                            {item.title}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs ${item.type === 'Etkinlik' ? 'bg-purple-500/10 text-purple-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-foreground flex items-center justify-end gap-1">
                                            <Eye className="w-3 h-3 text-muted-foreground" />
                                            {item.views || 0}
                                        </td>
                                    </tr>
                                ))}
                                {popularContent.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                                            Henüz veri yok.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <button onClick={() => onNavigate?.('events', { mode: 'form' })} className="p-4 bg-muted hover:bg-muted/80 rounded-xl text-left border border-border transition-all">
                    <Calendar className="w-6 h-6 text-primary mb-2" />
                    <div className="font-bold">Etkinlik Ekle</div>
                </button>
                <button onClick={() => onNavigate?.('clubs')} className="p-4 bg-muted hover:bg-muted/80 rounded-xl text-left border border-border transition-all">
                    <Users className="w-6 h-6 text-blue-500 mb-2" />
                    <div className="font-bold">Kulüp Ekle</div>
                </button>
                <button onClick={() => onNavigate?.('discounts', { openForm: true })} className="p-4 bg-muted hover:bg-muted/80 rounded-xl text-left border border-border transition-all">
                    <Ticket className="w-6 h-6 text-green-500 mb-2" />
                    <div className="font-bold">Kupon Oluştur</div>
                </button>
                <button onClick={() => onNavigate?.('courses')} className="p-4 bg-muted hover:bg-muted/80 rounded-xl text-left border border-border transition-all">
                    <BookOpen className="w-6 h-6 text-orange-500 mb-2" />
                    <div className="font-bold">Kurs Ekle</div>
                </button>
            </div>
        </div>
    );
}

function StatCard({ title, value, subValue, icon }: any) {
    return (
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
                    <div className="text-2xl font-bold text-foreground mt-1">{value}</div>
                    {subValue && <div className="text-xs text-muted-foreground mt-1">{subValue}</div>}
                </div>
                <div className="p-3 bg-muted rounded-xl">
                    {icon}
                </div>
            </div>
        </div>
    );
}
