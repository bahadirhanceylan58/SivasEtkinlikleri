"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Phone, Mail, Instagram, MapPin, Send } from "lucide-react";

export default function ContactPage() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Mesajınız alındı! En kısa sürede size dönüş yapacağız.");
        // Here you would normally send the data to a backend
    };

    return (
        <main className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            <section className="py-20 flex-grow flex items-center">
                <div className="container mx-auto px-4">

                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold text-white mb-4">Bize Ulaşın</h1>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            Sorularınız, iş birlikleri veya sadece merhaba demek için bizimle iletişime geçebilirsiniz.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="bg-neutral-900/50 border border-white/10 p-8 rounded-3xl space-y-6">
                                <h2 className="text-2xl font-bold text-white mb-6">İletişim Bilgileri</h2>

                                <a href="tel:05301120336" className="flex items-center gap-4 group p-4 rounded-xl hover:bg-white/5 transition-colors">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="block text-sm text-gray-400">Telefon</span>
                                        <span className="text-lg font-bold text-white group-hover:text-primary transition-colors">0530 112 0336</span>
                                    </div>
                                </a>

                                <a href="mailto:info@sivasetkinlikleri.com" className="flex items-center gap-4 group p-4 rounded-xl hover:bg-white/5 transition-colors">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="block text-sm text-gray-400">E-posta</span>
                                        <span className="text-lg font-bold text-white group-hover:text-primary transition-colors">info@sivasetkinlikleri.com</span>
                                    </div>
                                </a>

                                <a href="https://www.instagram.com/sivasetkinlikleri/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group p-4 rounded-xl hover:bg-white/5 transition-colors">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                                        <Instagram className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="block text-sm text-gray-400">Instagram</span>
                                        <span className="text-lg font-bold text-white group-hover:text-primary transition-colors">@sivasetkinlikleri</span>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                            <h2 className="text-2xl font-bold text-white mb-6">Bize Yazın</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Adınız</label>
                                        <input type="text" required placeholder="Adınız" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Soyadınız</label>
                                        <input type="text" required placeholder="Soyadınız" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">E-posta Adresi</label>
                                    <input type="email" required placeholder="ornek@email.com" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Mesajınız</label>
                                    <textarea required rows={4} placeholder="Size nasıl yardımcı olabiliriz?" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none"></textarea>
                                </div>

                                <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2">
                                    <Send className="w-5 h-5" />
                                    Gönder
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
