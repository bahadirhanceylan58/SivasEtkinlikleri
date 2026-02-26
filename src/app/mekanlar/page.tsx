"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Info } from "lucide-react";

// Geçiçi mekan verileri
const venues = [
    {
        id: 1,
        name: "Muhsin Yazıcıoğlu Kültür Merkezi",
        address: "Kardeşler Mahallesi, 58000 Sivas Merkez/Sivas",
        description: "Sivas'ın en büyük kapalı etkinlik alanlarından biri. Konser, tiyatro ve konferanslar için ideal.",
        capacity: "1200",
        image: "https://images.unsplash.com/photo-1507676184212-d0330a15673c?q=80&w=2069&auto=format&fit=crop"
    },
    {
        id: 2,
        name: "Fidan Yazıcıoğlu Kültür Merkezi",
        address: "Kadı Burhaneddin, 58040 Sivas Merkez/Sivas",
        description: "Şehrin merkezinde çeşitli sanatsal ve kültürel etkinliklere ev sahipliği yapan modern kompleks.",
        capacity: "850",
        image: "https://images.unsplash.com/photo-1588693817340-9a4f4efadbc1?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: 3,
        name: "Sivas Kongre Müzesi Bahçesi",
        address: "Kardeşler, 58070 Sivas Merkez/Sivas",
        description: "Açık hava konserleri ve yaz dönemi etkinlikleri için tarihi bir atmosfer sunan özel alan.",
        capacity: "5000+",
        image: "https://images.unsplash.com/photo-1470229722913-7c092db62220?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: 4,
        name: "Sivas 4 Eylül Stadyumu",
        address: "Gültepe, 58000 Sivas Merkez/Sivas",
        description: "Büyük çaplı dev konserler ve dev spor müsabakaları için Sivas'ın en yüksek kapasiteli stadyumu.",
        capacity: "27532",
        image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=2128&auto=format&fit=crop"
    }
];

export default function MekanlarPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans">
            <Navbar />

            <div className="container mx-auto px-4 pt-32 pb-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Etkinlik Mekanları</h1>
                    <p className="text-gray-400 text-lg max-w-2xl">
                        Sivas'ta gerçekleşen birbirinden güzel etkinliklerin ev sahiplerini keşfedin. Güncel konser, tiyatro ve festival alanları hakkında detaylı bilgi alın.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {venues.map((venue) => (
                        <div key={venue.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-yellow-500/50 transition-colors group">
                            <div className="h-64 relative overflow-hidden">
                                <img
                                    src={venue.image}
                                    alt={venue.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h2 className="text-2xl font-bold text-white">{venue.name}</h2>
                                    <div className="flex items-center gap-2 text-yellow-500 mt-2 text-sm">
                                        <MapPin size={16} />
                                        <span>{venue.address}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <p className="text-gray-400 mb-4 line-clamp-2">
                                    {venue.description}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <Info size={16} />
                                        <span>Kapasite: <strong className="text-white">{venue.capacity} Kişi</strong></span>
                                    </div>
                                    <button className="text-yellow-500 hover:text-yellow-400 text-sm font-medium transition-colors">
                                        Etkinlikleri Gör
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">Mekanınızda Etkinlik Düzenleyin</h3>
                    <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                        Mekanınızda ulusal veya yerel çapta konser, tiyatro veya organizasyonlar düzenlemek için bizimle iletişime geçebilirsiniz.
                    </p>
                    <a href="mailto:destek@sivasetkinlikleri.com" className="inline-block bg-primary text-black font-bold px-8 py-3 rounded-lg hover:bg-yellow-400 transition-colors">
                        Bizimle İletişime Geçin
                    </a>
                </div>
            </div>

            <Footer />
        </div>
    );
}
