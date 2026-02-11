"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, Search, Download, Phone, Mail, Calendar, User, Ticket, CreditCard } from "lucide-react";

interface Reservation {
    id: string;
    contactName: string;
    contactPhone: string;
    ticketCount: number;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    purchaseDate: string;
    paymentMethod: string;
    qrCode: string;
}

interface EventAttendeesModalProps {
    eventId: string;
    eventTitle: string;
    onClose: () => void;
}

export default function EventAttendeesModal({ eventId, eventTitle, onClose }: EventAttendeesModalProps) {
    const [attendees, setAttendees] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        setLoading(true);
        const reservationsRef = collection(db, "events", eventId, "reservations");
        const q = query(reservationsRef);

        // Real-time listener using onSnapshot
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedAttendees = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Reservation[];

            // Client-side sort by date descending
            fetchedAttendees.sort((a, b) => {
                return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
            });

            setAttendees(fetchedAttendees);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching attendees:", error);
            setLoading(false);
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, [eventId]);

    const filteredAttendees = attendees.filter(attendee =>
        attendee.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attendee.contactPhone?.includes(searchTerm) ||
        attendee.qrCode?.includes(searchTerm)
    );

    const totalTickets = attendees.reduce((acc, curr) => acc + curr.ticketCount, 0);
    const totalRevenue = attendees.reduce((acc, curr) => acc + curr.totalAmount, 0);

    const downloadCSV = () => {
        const headers = ["Ad Soyad", "Telefon", "Bilet Adeti", "Toplam Tutar", "Durum", "Ödeme", "Tarih", "QR Kod"];
        const csvContent = [
            headers.join(","),
            ...filteredAttendees.map(a => [
                `"${a.contactName || '-'}"`,
                `"${a.contactPhone || '-'}"`,
                a.ticketCount,
                a.totalAmount,
                a.status,
                a.paymentStatus,
                `"${new Date(a.purchaseDate).toLocaleString('tr-TR')}"`,
                a.qrCode
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_katilimcilar.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn">

                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex justify-between items-start bg-zinc-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <User className="text-primary" size={24} />
                            Katılımcı Listesi
                        </h2>
                        <p className="text-zinc-400 text-sm mt-1">{eventTitle}</p>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                {/* Stats & Tools */}
                <div className="p-6 bg-zinc-900/30 border-b border-zinc-800 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 flex-1 md:flex-none min-w-[120px]">
                            <p className="text-xs text-zinc-500">Toplam Bilet</p>
                            <p className="text-xl font-bold text-white">{totalTickets}</p>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 flex-1 md:flex-none min-w-[120px]">
                            <p className="text-xs text-zinc-500">Tahmini Gelir</p>
                            <p className="text-xl font-bold text-green-500">{totalRevenue} ₺</p>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Search className="absolute left-3 top-2.5 text-zinc-500" size={18} />
                            <input
                                type="text"
                                placeholder="İsim, telefon veya QR..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-64 bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-primary outline-none"
                            />
                        </div>
                        <button
                            onClick={downloadCSV}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white p-2 rounded-lg border border-zinc-700 transition-colors"
                            title="CSV Olarak İndir"
                        >
                            <Download size={20} />
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-auto p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                            Yükleniyor...
                        </div>
                    ) : filteredAttendees.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                            <User size={48} className="opacity-20 mb-2" />
                            <p>Kayıtlı katılımcı bulunamadı.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-900/50 text-zinc-400 sticky top-0 backdrop-blur-md">
                                <tr>
                                    <th className="p-4 font-medium">Katılımcı</th>
                                    <th className="p-4 font-medium">Bilet</th>
                                    <th className="p-4 font-medium">Durum</th>
                                    <th className="p-4 font-medium">Tarih</th>
                                    <th className="p-4 font-medium text-right">Tutar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {filteredAttendees.map((attendee) => (
                                    <tr key={attendee.id} className="hover:bg-zinc-900/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-white">{attendee.contactName}</span>
                                                <span className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                                    <Phone size={12} /> {attendee.contactPhone}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-zinc-800 text-white px-2 py-1 rounded text-xs font-bold w-6 h-6 flex items-center justify-center">
                                                    {attendee.ticketCount}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${attendee.status === 'valid' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                                    }`}>
                                                    {attendee.status === 'valid' ? 'Onaylı' : attendee.status}
                                                </span>
                                                <span className="text-xs text-zinc-500 flex items-center gap-1">
                                                    <CreditCard size={12} />
                                                    {attendee.paymentMethod === 'door' ? 'Kapıda' : 'Kredi Kartı'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-zinc-400">
                                            {new Date(attendee.purchaseDate).toLocaleDateString("tr-TR")}
                                            <br />
                                            <span className="text-xs opacity-50">
                                                {new Date(attendee.purchaseDate).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-medium text-white">
                                            {attendee.totalAmount} ₺
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
