"use client";

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { RefreshCcw, Check, X, Loader2 } from 'lucide-react';

export default function RefundManagement() {
    const { user: authUser } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, 'orders'), where('status', '==', 'refund_requested'));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRequests(data);
        } catch (error) {
            console.error("Error fetching refund requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (orderId: string, eventId: string, userUid: string) => {
        if (!authUser) return;
        const confirm = window.confirm("İadeyi onaylamak istediğinize emin misiniz? Tutar kullanıcıya iade edilecek ve bilet iptal edilecektir.");
        if (!confirm) return;

        try {
            setActionLoading(orderId);
            const response = await fetch('/api/payment/refund', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    merchant_oid: orderId, 
                    eventId, 
                    userUid,
                    adminUid: authUser.uid
                })
            });

            if (!response.ok) {
                const responseText = await response.text();
                let err;
                try {
                    err = JSON.parse(responseText);
                } catch (e) {
                    throw new Error('Sunucu hatası (Geçersiz yanıt).');
                }
                throw new Error(err.error || 'Refund failed');
            }

            alert("İade başarıyla tamamlandı.");
            fetchRequests();
        } catch (error: any) {
            console.error("Refund error:", error);
            alert("İade işlemi sırasında hata: " + error.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (orderId: string, userUid: string) => {
        const confirm = window.confirm("İade talebini reddetmek istediğinize emin misiniz? Bilet tekrar aktif hale gelecektir.");
        if (!confirm) return;

        try {
            setActionLoading(orderId);

            // 1. Update order status back to 'approved'
            await updateDoc(doc(db, 'orders', orderId), { status: 'approved' });

            // 2. Update user's ticket status back to 'valid'
            const userRef = doc(db, 'users', userUid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                const updatedTickets = userData.tickets.map((t: any) => {
                    if (t.qrCode === orderId) {
                        return { ...t, status: 'valid' };
                    }
                    return t;
                });
                await updateDoc(userRef, { tickets: updatedTickets });
            }

            fetchRequests();
        } catch (error: any) {
            console.error("Reject error:", error);
            alert("Reddetme işlemi sırasında hata: " + error.message);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <RefreshCcw className="w-6 h-6 text-primary" />
                İade Talepleri
            </h2>

            {requests.length === 0 ? (
                <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/10 text-center text-gray-400">
                    Bekleyen iade talebi bulunmamaktadır.
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map((req: any) => (
                        <div key={req.id} className="bg-zinc-900/50 p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/20 transition-all">
                            <div>
                                <h3 className="font-bold text-lg text-white">{req.eventTitle || 'Bilinmeyen Etkinlik'}</h3>
                                <p className="text-sm text-gray-400">Müşteri: {req.contactName || 'Belirtilmedi'} ({req.contactEmail || 'Belirtilmedi'})</p>
                                <p className="text-sm text-gray-400">Sipariş ID: {req.id}</p>
                                <div className="mt-2 text-xs text-gray-500">
                                    <span className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">Bilet: {req.ticketCount} Adet</span>
                                    {req.payment_amount && (
                                        <span className="ml-2 bg-zinc-800 px-2 py-1 rounded border border-zinc-700 text-green-400">
                                            {req.payment_amount / 100} ₺ Ödendi
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <button
                                    onClick={() => handleReject(req.id, req.userUid)}
                                    disabled={actionLoading === req.id}
                                    className="flex-1 md:flex-none bg-red-500/10 hover:bg-red-500/20 text-red-500 p-3 md:p-2 rounded-xl border border-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center"
                                    title="Talebi Reddet"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleApprove(req.id, req.eventId, req.userUid)}
                                    disabled={actionLoading === req.id}
                                    className="flex-1 md:flex-none bg-green-500/10 hover:bg-green-500/20 text-green-500 px-4 py-3 md:py-2 rounded-xl border border-green-500/20 font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {actionLoading === req.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                    İadeyi Onayla
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
