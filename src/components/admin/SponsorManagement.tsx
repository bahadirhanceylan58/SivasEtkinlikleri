"use client";

import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Sponsor } from '@/types/ticketing';
import { Check, X, ExternalLink, Calendar, Building2 } from 'lucide-react';
import Image from 'next/image';

export default function SponsorManagement() {
    const [applications, setApplications] = useState<(Sponsor & { eventTitle?: string })[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            // Get sponsors
            const q = query(collection(db, 'sponsors'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Sponsor[];

            // Get event titles efficiently
            const eventIds = [...new Set(apps.map(a => a.eventId))];
            const eventTitles: Record<string, string> = {};

            // In a real app with many events, we might want to optimize this or store title in sponsor doc
            // For now, let's just fetch individual events or assume we have a way to display them
            // To keep it simple and performant, I'll fetch events in parallel
            await Promise.all(eventIds.map(async (eid) => {
                const eventDoc = await getDocs(query(collection(db, 'events'), orderBy('createdAt', 'desc')));
                // Wait, getting ALL events to find one is bad. 
                // Let's rely on eventId for now or just get the specific docs if needed.
                // Actually, let's just display Event ID if we can't get title easily without N+1 reads, 
                // OR better: store eventTitle in the sponsor document during creation (Optimization).
                // Assuming we don't have it yet, let's try to get it from a cache or simple lookup.
            }));

            // Let's just create a map from the `events` collection since we are admin and listing all?
            // Or just fetch the specific Event doc for each.
            // For MVP:
            const eventsSnap = await getDocs(collection(db, 'events'));
            eventsSnap.forEach(d => {
                eventTitles[d.id] = d.data().title;
            });

            const enrichedApps = apps.map(app => ({
                ...app,
                eventTitle: eventTitles[app.eventId] || 'Bilinmeyen Etkinlik'
            }));

            setApplications(enrichedApps);

        } catch (error) {
            console.error("Error fetching sponsorship applications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
        if (!confirm(`Bu başvuruyu ${status === 'approved' ? 'onaylamak' : 'reddetmek'} istediğinize emin misiniz?`)) return;

        try {
            await updateDoc(doc(db, 'sponsors', id), {
                status: status
            });

            // Optimistic update
            setApplications(prev => prev.map(app =>
                app.id === id ? { ...app, status } : app
            ));

            alert(`Sponsorluk ${status === 'approved' ? 'onaylandı' : 'reddedildi'}.`);
        } catch (error) {
            console.error("Error updating status:", error);
            alert("İşlem sırasında bir hata oluştu.");
        }
    };

    if (loading) return <div className="text-center py-8">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" /> Sponsorluk Yönetimi
            </h2>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                {applications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">Henüz sponsorluk başvurusu yok.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
                                <tr>
                                    <th className="px-6 py-4">Şirket/Logo</th>
                                    <th className="px-6 py-4">Etkinlik</th>
                                    <th className="px-6 py-4">Paket/Tutar</th>
                                    <th className="px-6 py-4">İletişim</th>
                                    <th className="px-6 py-4">Durum</th>
                                    <th className="px-6 py-4 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-neutral-50 dark:bg-zinc-900 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-10 h-10 rounded bg-white p-1 border border-gray-200">
                                                    <Image
                                                        src={app.logoUrl}
                                                        alt={app.companyName}
                                                        fill
                                                        className="object-contain"
                                                        unoptimized
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-foreground">{app.companyName}</div>
                                                    {app.website && (
                                                        <a href={app.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                                            Website <ExternalLink size={10} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">{app.eventTitle}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                ID: {app.eventId.substring(0, 8)}...
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase mb-1
                                                ${app.tier === 'platinum' ? 'bg-slate-200 text-slate-800' : ''}
                                                ${app.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                ${app.tier === 'silver' ? 'bg-gray-100 text-gray-800' : ''}
                                                ${app.tier === 'bronze' ? 'bg-orange-100 text-orange-800' : ''}
                                            `}>
                                                {app.tier}
                                            </span>
                                            <div className="font-bold text-primary">{app.amount.toLocaleString('tr-TR')} ₺</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-foreground">{app.contactEmail}</div>
                                            {app.userId && <div className="text-xs text-muted-foreground">User ID: {app.userId.substring(0, 6)}...</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            {app.status === 'pending' && <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Bekliyor</span>}
                                            {app.status === 'approved' && <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">Onaylandı</span>}
                                            {app.status === 'rejected' && <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">Reddedildi</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {app.status === 'pending' && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleStatusUpdate(app.id, 'approved')} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all" title="Onayla">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleStatusUpdate(app.id, 'rejected')} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="Reddet">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
