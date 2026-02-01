"use client";

import { useState } from 'react';
import { collection, collectionGroup, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Camera, Search, CheckCircle, XCircle, QrCode, AlertTriangle, Loader2 } from 'lucide-react';

export default function TicketValidator() {
    interface ValidatedTicket {
        contactName?: string;
        eventTitle?: string;
        ticketCount: number;
        checkedIn: boolean;
        checkInTime?: string;
        qrCode?: string;
        userUid?: string;
        [key: string]: any; // Allow other fields from firestore
    }

    const [loading, setLoading] = useState(false);
    const [scanResult, setScanResult] = useState<{
        status: 'idle' | 'success' | 'error' | 'warning';
        message: string;
        ticketInfo?: ValidatedTicket;
        docRef?: any; // Keeping any for Firestore DocRef complex type for brevity, effectively DocumentReference
    }>({ status: 'idle', message: '' });

    const [manualCode, setManualCode] = useState('');

    const handleValidate = async (code: string) => {
        if (!code) return;
        const cleanCode = code.trim(); // Trim spaces
        setLoading(true);
        setScanResult({ status: 'idle', message: 'Aranıyor...' });

        try {
            let querySnapshot;

            // Parse QR Format: uid-eventId-timestamp
            const parts = cleanCode.split('-');
            let potentialEventId = '';
            let potentialUid = '';

            if (parts.length >= 3) {
                potentialUid = parts[0];
                // timestamp is last, so eventID is everything in between
                potentialEventId = parts.slice(1, -1).join('-');

                try {
                    // 1. Direct Query by QR Code
                    const specificRef = collection(db, 'events', potentialEventId, 'reservations');
                    const q = query(specificRef, where('qrCode', '==', cleanCode));
                    const snap = await getDocs(q);
                    if (!snap.empty) querySnapshot = snap;
                } catch (e) {
                    console.warn("Specific query failed", e);
                }

                // 2. Legacy Fallback: Search by User UID (for tickets created before QR system)
                if (!querySnapshot || querySnapshot.empty) {
                    try {
                        const legacyRef = collection(db, 'events', potentialEventId, 'reservations');
                        // Find all tickets for this user in this event
                        const qLegacy = query(legacyRef, where('userUid', '==', potentialUid));
                        const legacySnap = await getDocs(qLegacy);

                        if (!legacySnap.empty) {
                            // Find a ticket that either matches code OR has no code (Legacy)
                            const match = legacySnap.docs.find(d => d.data().qrCode === cleanCode) ||
                                legacySnap.docs.find(d => !d.data().qrCode); // Legacy match

                            if (match) {
                                // Synthesize a snapshot-like object for consistent handling below
                                querySnapshot = {
                                    empty: false,
                                    docs: [match]
                                } as any;
                            }
                        }
                    } catch (e) {
                        console.warn("Legacy query failed", e);
                    }
                }
            }

            // 3. Fallback: Fan-out Search across all events (Last Resort)
            if (!querySnapshot || querySnapshot.empty) {
                try {
                    // Fetch all active events first
                    const eventsRef = collection(db, 'events');
                    const eventsSnap = await getDocs(eventsRef);

                    // Search across all events in parallel
                    const searchPromises = eventsSnap.docs.map(async (eventDoc) => {
                        const resRef = collection(db, 'events', eventDoc.id, 'reservations');
                        const q = query(resRef, where('qrCode', '==', cleanCode));
                        const snap = await getDocs(q);
                        return !snap.empty ? snap : null;
                    });

                    const results = await Promise.all(searchPromises);
                    const foundSnap = results.find(r => r !== null);

                    if (foundSnap) {
                        querySnapshot = foundSnap;
                    }
                } catch (err) {
                    console.error("Fallback search failed:", err);
                }
            }

            if (!querySnapshot || querySnapshot.empty) {
                setScanResult({
                    status: 'error',
                    message: 'Geçersiz Bilet Kodu!',
                });
                setLoading(false);
                return;
            }

            // Functionally there should be only one, but we take the first
            const ticketDoc = querySnapshot.docs[0];
            const ticketData = ticketDoc.data() as ValidatedTicket;

            if (ticketData.checkedIn) {
                setScanResult({
                    status: 'warning',
                    message: 'Bu bilet daha önce kullanılmış!',
                    ticketInfo: ticketData,
                    docRef: ticketDoc.ref
                });
            } else {
                setScanResult({
                    status: 'success',
                    message: 'Bilet Geçerli',
                    ticketInfo: ticketData,
                    docRef: ticketDoc.ref
                });
            }

        } catch (error: any) {
            console.error("Validation error:", error);
            setScanResult({
                status: 'error',
                message: error.message || 'Doğrulama sırasında bir hata oluştu.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!scanResult.docRef) return;
        setLoading(true);
        try {
            await updateDoc(scanResult.docRef, {
                checkedIn: true,
                checkInTime: new Date().toISOString()
            });

            setScanResult(prev => ({
                ...prev,
                status: 'warning', // Now it's checked in as "used"
                message: 'Giriş Başarılı - Bilet Kullanıldı İşaretlendi',
                ticketInfo: { ...prev.ticketInfo, checkedIn: true }
            }));

            // Optional: Reset after delay
            // setTimeout(() => setScanResult({ status: 'idle', message: '' }), 3000);

        } catch (error) {
            console.error("Check-in error:", error);
            alert("Giriş işlemi yapılamadı.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                    <QrCode className="text-primary" />
                    Bilet Doğrulama Terminali
                </h2>
                <p className="text-muted-foreground">QR kodu kameraya gösterin veya bilet kodunu manuel girin.</p>
            </div>

            {/* Scanner Area */}
            <div className="bg-card border-2 border-dashed border-border rounded-3xl p-8 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden group shadow-sm transition-colors">

                {scanResult.status === 'idle' && !loading && (
                    <>
                        <div className="w-64 h-64 bg-muted/50 rounded-2xl flex items-center justify-center mb-6 relative">
                            <Camera className="w-16 h-16 text-muted-foreground" />
                            <div className="absolute inset-0 border-2 border-primary/50 animate-pulse rounded-2xl"></div>
                            {/* Scanning line animation */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-primary/80 shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
                        </div>
                        <button
                            onClick={() => alert("Kamera entegrasyonu şu an devre dışı (HTTPS gerektirir). Lütfen manuel kod girin.")}
                            className="bg-primary hover:bg-primary-hover text-black font-bold py-3 px-8 rounded-xl transition-all shadow-glow hover:shadow-glow-lg"
                        >
                            Kamerayı Başlat
                        </button>
                    </>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center text-primary">
                        <Loader2 className="w-12 h-12 animate-spin mb-4" />
                        <span className="text-lg font-medium">İşleniyor...</span>
                    </div>
                )}

                {!loading && scanResult.status !== 'idle' && (
                    <div className="flex flex-col items-center animate-in zoom-in duration-300 w-full">
                        {scanResult.status === 'success' ? (
                            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-4 border border-green-500/50">
                                <CheckCircle className="w-12 h-12" />
                            </div>
                        ) : scanResult.status === 'warning' ? (
                            <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 mb-4 border border-yellow-500/50">
                                <AlertTriangle className="w-12 h-12" />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mb-4 border border-red-500/50">
                                <XCircle className="w-12 h-12" />
                            </div>
                        )}

                        <h3 className={`text-2xl font-bold mb-2 ${scanResult.status === 'success' ? 'text-green-600 dark:text-green-500' :
                            scanResult.status === 'warning' ? 'text-yellow-600 dark:text-yellow-500' :
                                'text-red-600 dark:text-red-500'
                            }`}>
                            {scanResult.message}
                        </h3>

                        {scanResult.ticketInfo && (
                            <div className="bg-muted/50 rounded-xl p-6 w-full max-w-sm mt-4 space-y-3 border border-border">
                                <div className="flex justify-between border-b border-border pb-2">
                                    <span className="text-muted-foreground">İsim:</span>
                                    <span className="text-foreground font-medium">{scanResult.ticketInfo.contactName || 'İsimsiz'}</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-2">
                                    <span className="text-muted-foreground">Etkinlik:</span>
                                    <span className="text-foreground font-medium text-right line-clamp-1 pl-4">{scanResult.ticketInfo.eventTitle || 'Bilinmiyor'}</span>
                                </div>
                                <div className="flex justify-between border-b border-border pb-2">
                                    <span className="text-muted-foreground">Bilet Adeti:</span>
                                    <span className="text-primary font-bold">{scanResult.ticketInfo.ticketCount}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-muted-foreground">Durum:</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${scanResult.ticketInfo.checkedIn ? 'bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-green-500/20 text-green-600 dark:text-green-400'}`}>
                                        {scanResult.ticketInfo.checkedIn ? 'KULLANILDI' : 'KULLANILABİLİR'}
                                    </span>
                                </div>

                                {scanResult.status === 'success' && !scanResult.ticketInfo.checkedIn && (
                                    <button
                                        onClick={handleCheckIn}
                                        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md"
                                    >
                                        Giriş Yap (Check-In)
                                    </button>
                                )}
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setScanResult({ status: 'idle', message: '' });
                                setManualCode('');
                            }}
                            className="mt-8 text-black dark:text-white font-bold underline"
                        >
                            Yeni Tarama Yap
                        </button>
                    </div>
                )}
            </div>

            {/* Manual Entry */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-neutral-500 w-5 h-5 z-10" />
                    <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Bilet Kodu (örn: TICK-8392)"
                        className="w-full bg-neutral-50 dark:bg-black border border-neutral-300 dark:border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-black dark:text-white focus:outline-none focus:border-primary/50 placeholder:text-neutral-400 shadow-sm transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleValidate(manualCode)}
                    />
                </div>
                <button
                    onClick={() => handleValidate(manualCode)}
                    disabled={loading || !manualCode}
                    className="bg-primary hover:bg-primary-hover text-black font-bold px-6 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                >
                    Doğrula
                </button>
            </div>
        </div>
    );
}
