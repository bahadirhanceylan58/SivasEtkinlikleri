"use client";

import { useState } from 'react';
import { Camera, Search, CheckCircle, XCircle, QrCode } from 'lucide-react';

export default function TicketValidator() {
    const [ticketStats, setTicketStats] = useState({
        total: 156,
        checkedIn: 42,
        remaining: 114
    });

    const [scanResult, setScanResult] = useState<{
        status: 'idle' | 'success' | 'error';
        message: string;
        ticketInfo?: any;
    }>({ status: 'idle', message: '' });

    const [manualCode, setManualCode] = useState('');

    const handleSimulateScan = () => {
        setScanResult({ status: 'idle', message: 'Taranıyor...' });

        // Simulating scan delay
        setTimeout(() => {
            const isSuccess = Math.random() > 0.3; // 70% success chance for demo

            if (isSuccess) {
                setScanResult({
                    status: 'success',
                    message: 'Bilet Doğrulandı',
                    ticketInfo: {
                        name: 'Ahmet Yılmaz',
                        category: 'Genel Giriş',
                        seat: 'A-12',
                        type: 'Tam'
                    }
                });
                setTicketStats(prev => ({ ...prev, checkedIn: prev.checkedIn + 1, remaining: prev.remaining - 1 }));
            } else {
                setScanResult({
                    status: 'error',
                    message: 'Geçersiz veya Kullanılmış Bilet!',
                });
            }
        }, 1500);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <QrCode className="text-primary" />
                    Bilet Doğrulama Terminali
                </h2>
                <p className="text-gray-400">QR kodu kameraya gösterin veya bilet kodunu manuel girin.</p>
            </div>

            {/* Check-in Progress */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between">
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{ticketStats.total}</div>
                    <div className="text-xs text-gray-500">Toplam Bilet</div>
                </div>
                <div className="flex-1 mx-6">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>Check-in: {Math.round((ticketStats.checkedIn / ticketStats.total) * 100)}%</span>
                        <span>Kalan: {ticketStats.remaining}</span>
                    </div>
                    <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${(ticketStats.checkedIn / ticketStats.total) * 100}%` }}
                        ></div>
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{ticketStats.checkedIn}</div>
                    <div className="text-xs text-gray-500">İçerideki</div>
                </div>
            </div>

            {/* Scanner Area */}
            <div className="bg-black/40 border-2 border-dashed border-neutral-700 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden group">

                {scanResult.status === 'idle' ? (
                    <>
                        <div className="w-64 h-64 bg-white/5 rounded-2xl flex items-center justify-center mb-6 relative">
                            <Camera className="w-16 h-16 text-gray-600" />
                            <div className="absolute inset-0 border-2 border-primary/50 animate-pulse rounded-2xl"></div>
                            {/* Scanning line animation */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-primary/80 shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
                        </div>
                        <button
                            onClick={handleSimulateScan}
                            className="bg-primary hover:bg-primary-hover text-black font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(250,204,21,0.2)]"
                        >
                            Kamerayı Başlat / Simüle Et
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                        {scanResult.status === 'success' ? (
                            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-4 border border-green-500/50">
                                <CheckCircle className="w-12 h-12" />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mb-4 border border-red-500/50">
                                <XCircle className="w-12 h-12" />
                            </div>
                        )}

                        <h3 className={`text-2xl font-bold mb-2 ${scanResult.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                            {scanResult.message}
                        </h3>

                        {scanResult.ticketInfo && (
                            <div className="bg-white/5 rounded-xl p-4 w-full max-w-xs mt-4 space-y-2 border border-white/10">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">İsim:</span>
                                    <span className="text-white font-medium">{scanResult.ticketInfo.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Kategori:</span>
                                    <span className="text-white font-medium">{scanResult.ticketInfo.category}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Koltuk:</span>
                                    <span className="text-yellow-500 font-bold">{scanResult.ticketInfo.seat}</span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setScanResult({ status: 'idle', message: '' })}
                            className="mt-8 text-gray-400 hover:text-white underline"
                        >
                            Yeni Tarama Yap
                        </button>
                    </div>
                )}
            </div>

            {/* Manual Entry */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Manuel Bilet Kodu (örn: TICK-8392)"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary/50"
                    />
                </div>
                <button
                    onClick={handleSimulateScan}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-6 rounded-xl transition-colors"
                >
                    Doğrula
                </button>
            </div>
        </div>
    );
}
