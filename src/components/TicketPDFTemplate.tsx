import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, Clock, MapPin, User, Tag, Armchair } from 'lucide-react';

export interface TicketData {
    eventId: string;
    eventTitle: string;
    eventDate: string;
    eventTime?: string;
    eventLocation: string;
    eventImage?: string;
    contactName: string;
    ticketCount: number;
    totalAmount: number;
    qrCode: string;
    seatNames?: string;
    paymentType?: string;
    purchaseDate: string;
}

interface TicketPDFTemplateProps {
    ticket: TicketData;
}

export const TicketPDFTemplate: React.FC<TicketPDFTemplateProps> = ({ ticket }) => {
    return (
        <div id="pdf-ticket-container" className="bg-white text-black p-8 w-[800px] font-sans mx-auto shadow-md">
            {/* Header: Company/Platform Name */}
            <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter">SİVAS ETKİNLİKLERİ</h1>
                    <p className="text-sm font-semibold text-gray-600 mt-1">RESMİ ETKİNLİK BİLETİ</p>
                </div>
                <div className="text-right text-xs text-gray-500">
                    <p>Bilet No: {ticket.qrCode.substring(0, 10).toUpperCase()}</p>
                    <p>Oluşturulma: {new Date(ticket.purchaseDate).toLocaleDateString("tr-TR")}</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex gap-8">
                {/* Left Side: Event Details */}
                <div className="flex-1 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold leading-tight mb-2">{ticket.eventTitle}</h2>

                        <div className="flex items-start gap-2 mt-4">
                            <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="font-semibold text-lg">
                                    {new Date(ticket.eventDate).toLocaleDateString('tr-TR', {
                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {ticket.eventTime && (
                            <div className="flex items-center gap-2 mt-2">
                                <Clock className="w-5 h-5 text-gray-500" />
                                <p className="font-semibold text-lg">{ticket.eventTime}</p>
                            </div>
                        )}

                        <div className="flex items-start gap-2 mt-3 text-gray-700">
                            <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                            <p className="text-base">{ticket.eventLocation}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-2">
                            <User className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Bilet Sahibi</p>
                                <p className="font-bold">{ticket.contactName}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <Tag className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Adet / Tutar</p>
                                <p className="font-bold">{ticket.ticketCount} Adet - {ticket.totalAmount} ₺</p>
                            </div>
                        </div>

                        {ticket.seatNames && (
                            <div className="flex items-start gap-2 col-span-2 mt-2">
                                <Armchair className="w-5 h-5 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Koltuklar</p>
                                    <p className="font-bold text-lg">{ticket.seatNames}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: QR Code & Status */}
                <div className="w-64 flex flex-col items-center justify-center border-l-2 border-dashed border-gray-300 pl-8">
                    <div className="bg-white p-3 border-4 border-black rounded-xl mb-4">
                        <QRCodeSVG value={ticket.qrCode} size={150} level="H" />
                    </div>
                    <p className="text-center text-xs text-gray-500 mb-2">
                        Girişte bu kodu etkinlik görevlisine okutunuz.
                    </p>
                    <div className={`px-4 py-2 w-full text-center rounded-lg font-bold text-sm ${ticket.paymentType === 'pay_at_door'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                            : 'bg-green-100 text-green-800 border border-green-300'
                        }`}>
                        {ticket.paymentType === 'pay_at_door' ? 'KAPIDA ÖDEME' : 'ÖDENDİ'}
                    </div>
                </div>
            </div>

            {/* Footer / Terms */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
                <p>Bu bilet tek kullanımlıktır. Çoğaltılması veya satılması yasaktır.</p>
                <p>Etkinlik alanına girerken kimlik ibrazı istenebilir. Sivas Etkinlikleri keyifli seyirler diler!</p>
            </div>
        </div>
    );
};

export default TicketPDFTemplate;
