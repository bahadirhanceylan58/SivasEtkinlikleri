'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TicketPDFTemplate, { TicketData } from '@/components/TicketPDFTemplate';
import { createRoot } from 'react-dom/client';

export default function MyTicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingTicketId, setDownloadingTicketId] = useState<string | null>(null);
    const [selectedQr, setSelectedQr] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push('/login');
                return;
            }

            try {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().tickets) {
                    // Biletleri tarihe göre (en yeni en üstte) sırala
                    const sortedTickets = docSnap.data().tickets.reverse();
                    setTickets(sortedTickets);
                }
            } catch (error) {
                console.error("Error fetching tickets:", error);
            } finally {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleDownloadPdf = async (ticket: any) => {
        try {
            setDownloadingTicketId(ticket.qrCode);
            // Dynamically import html2pdf only on client side when needed
            const html2pdf = (await import('html2pdf.js')).default;

            // Create a temporary container
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '-9999px';
            document.body.appendChild(container);

            // Create a root and render the template
            const root = createRoot(container);

            const ticketData: TicketData = {
                eventId: ticket.eventId,
                eventTitle: ticket.eventTitle,
                eventDate: ticket.eventDate,
                eventTime: ticket.eventTime,
                eventLocation: ticket.eventLocation,
                eventImage: ticket.eventImage,
                contactName: ticket.contactName,
                ticketCount: ticket.ticketCount,
                totalAmount: ticket.totalAmount,
                qrCode: ticket.qrCode,
                seatNames: ticket.seatNames,
                paymentType: ticket.paymentType,
                purchaseDate: ticket.purchaseDate || new Date().toISOString()
            };

            // Wrap in a promise to wait for React to finish rendering
            await new Promise<void>((resolve) => {
                root.render(<TicketPDFTemplate ticket={ticketData} />);
                // Give React a moment to render the DOM
                setTimeout(resolve, 500);
            });

            const element = container.querySelector('#pdf-ticket-container') as HTMLElement;
            if (!element) throw new Error("Template rendered incorrectly");

            const opt = {
                margin: 10,
                filename: `bilet-${ticket.qrCode.substring(0, 8)}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
            };

            await html2pdf().set(opt).from(element as HTMLElement).save();

            // Cleanup
            setTimeout(() => {
                root.unmount();
                document.body.removeChild(container);
                setDownloadingTicketId(null);
            }, 500);

        } catch (error) {
            console.error("PDF oluşturma hatası:", error);
            alert("PDF oluşturulurken bir hata meydana geldi.");
            setDownloadingTicketId(null);
        }
    };

    const handleRefundRequest = async (ticketToRefund: any) => {
        const eventDate = new Date(ticketToRefund.eventDate);
        const now = new Date();
        const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (diffHours < 48) {
            alert('İade talebi sadece etkinliğe en az 48 saat kala yapılabilir.');
            return;
        }

        const confirmRefund = window.confirm('Biletinizi iade etmek istediğinize emin misiniz?\n\nİade talebiniz incelenecek ve onaylandığında ücret iadesi yapılacaktır. Bu işlem geri alınamaz.');

        if (!confirmRefund) return;

        try {
            if (!auth.currentUser) return;

            // 1. Update user's ticket array
            const userRef = doc(db, 'users', auth.currentUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                const updatedTickets = userData.tickets.map((t: any) => {
                    if (t.qrCode === ticketToRefund.qrCode) {
                        return { ...t, status: 'refund_requested' };
                    }
                    return t;
                });

                await updateDoc(userRef, { tickets: updatedTickets });

                // Update local state without breaking the order
                // The new fetch logic reverse sorted it initially. Since we preserve array order here,
                // we should just reverse the original user.tickets array again to match the state.
                setTickets(updatedTickets.reverse());
            }

            // 2. Update order document
            const orderRef = doc(db, 'orders', ticketToRefund.qrCode);
            await updateDoc(orderRef, {
                status: 'refund_requested',
                updatedAt: new Date().toISOString()
            });

            alert('İade talebiniz başarıyla alındı. Durumu buradan takip edebilirsiniz.');

        } catch (error) {
            console.error("İade talebi oluşturulurken hata:", error);
            alert("İade talebi oluşturulamadı, lütfen daha sonra tekrar deneyin.");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <div className="text-xl animate-pulse">Biletler yükleniyor...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
            <Navbar />
            <div className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-foreground">Biletlerim</h1>

                {tickets.length === 0 ? (
                    <div className="text-muted-foreground text-center py-12 bg-muted/30 rounded-xl border border-border">
                        <p className="text-lg mb-4">Henüz biletiniz bulunmamaktadır.</p>
                        <button onClick={() => router.push('/')} className="text-primary hover:underline">
                            Etkinliklere Göz At
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 max-w-4xl mx-auto">
                        {tickets.map((ticket, index) => (
                            <div key={index} className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 hover:border-primary/50 transition-all group shadow-sm">

                                {/* Sol: Tarih Kutusu */}
                                <div className="bg-muted rounded-lg p-3 flex flex-col items-center justify-center min-w-[80px]">
                                    <span className="text-primary font-bold text-xl">
                                        {new Date(ticket.eventDate).getDate()}
                                    </span>
                                    <span className="text-xs uppercase text-muted-foreground">
                                        {new Date(ticket.eventDate).toLocaleDateString('tr-TR', { month: 'short' })}
                                    </span>
                                </div>
                                {/* Orta: Bilgiler */}
                                <div className="flex-grow">
                                    <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                                        {ticket.eventTitle}
                                        {ticket.status === 'refund_requested' && (
                                            <span className="bg-yellow-500/10 text-yellow-500 text-[10px] px-2 py-0.5 rounded border border-yellow-500/20 whitespace-nowrap">İade Bekliyor</span>
                                        )}
                                        {ticket.status === 'refunded' && (
                                            <span className="bg-red-500/10 text-red-500 text-[10px] px-2 py-0.5 rounded border border-red-500/20 whitespace-nowrap">İade Edildi</span>
                                        )}
                                    </h3>
                                    <div className="text-sm text-muted-foreground mt-1 flex items-center">
                                        <MapPin className="w-4 h-4 mr-1 text-primary" />
                                        {ticket.eventLocation}
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                                        <span className="bg-muted px-2 py-0.5 rounded">{ticket.ticketCount} Adet</span>
                                        <span>•</span>
                                        <span>Toplam {ticket.totalAmount} ₺</span>
                                        {ticket.seatNames && (
                                            <>
                                                <span>•</span>
                                                <span className="truncate max-w-[150px] sm:max-w-none" title={ticket.seatNames}>
                                                    Koltuk: {ticket.seatNames}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {/* Sağ: Butonlar */}
                                {ticket.status !== 'refunded' && ticket.status !== 'refund_requested' ? (
                                    <div className="flex items-center justify-end md:justify-center gap-2 mt-4 md:mt-0 flex-wrap">
                                        {((new Date(ticket.eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60)) >= 48 && (
                                            <button
                                                onClick={() => handleRefundRequest(ticket)}
                                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold px-3 py-2 rounded-lg text-xs transition-colors whitespace-nowrap border border-red-500/20"
                                            >
                                                İade Talep Et
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDownloadPdf(ticket)}
                                            disabled={downloadingTicketId === ticket.qrCode}
                                            className="bg-muted hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground font-semibold px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap disabled:opacity-50"
                                        >
                                            {downloadingTicketId === ticket.qrCode ? 'İndiriliyor...' : 'PDF İndir'}
                                        </button>
                                        <button
                                            onClick={() => setSelectedQr(ticket.qrCode)}
                                            className="bg-primary hover:bg-primary-hover text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap shadow-lg shadow-primary/10"
                                        >
                                            QR Göster
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-end md:justify-center gap-2 mt-4 md:mt-0">
                                        <span className="text-sm text-muted-foreground italic bg-muted px-3 py-2 rounded-lg border border-border">
                                            {ticket.status === 'refund_requested' ? 'İade talebiniz değerlendiriliyor.' : 'Biletiniz iptal edilmiştir.'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* QR Kod Modal (Pencere) */}
            {selectedQr && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setSelectedQr(null)}>
                    <div className="bg-card p-8 rounded-2xl flex flex-col items-center relative max-w-sm w-full animate-fadeIn border border-border" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedQr(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 transition-colors" aria-label="Kapat">
                            <X size={24} />
                        </button>
                        <h3 className="text-foreground font-bold mb-6 text-xl">Giriş Kodunuz</h3>
                        <div className="p-4 bg-white border-4 border-black rounded-xl">
                            <QRCodeSVG value={selectedQr} size={200} />
                        </div>

                        <div className="mt-6 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-4 py-2 rounded-lg text-center w-full">
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">Bilet Kodu</span>
                            <code className="text-lg font-mono font-bold text-neutral-900 dark:text-neutral-100 tracking-wider select-all break-all">
                                {selectedQr}
                            </code>
                        </div>

                        <p className="text-muted-foreground text-sm mt-4 text-center leading-relaxed">
                            Bu kodu etkinlik girişindeki<br />görevliye okutunuz.
                        </p>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}
