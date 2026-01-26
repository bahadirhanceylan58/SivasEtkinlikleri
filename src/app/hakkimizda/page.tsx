import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Sparkles, MapPin, Users, Heart } from "lucide-react";

export const metadata = {
    title: "Hakkımızda | Sivas Etkinlikleri",
    description: "Sivas'ın kültür, sanat ve eğlence hayatına rehberlik eden modern platform.",
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10"></div>
                <Image
                    src="https://images.unsplash.com/photo-1540932296774-744521396265?auto=format&fit=crop&q=80"
                    alt="Sivas Etkinlikleri"
                    fill
                    className="object-cover"
                />
                <div className="relative z-20 text-center px-4">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 font-heading">
                        <span className="text-white">Şehrin</span> <span className="text-primary">Kalbi</span> Burada Atıyor
                    </h1>
                    <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
                        Sivas'ın en güncel kültür, sanat ve eğlence platformu.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 flex-grow">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Visual */}
                        <div className="relative">
                            <div className="absolute -inset-4 bg-primary/20 rounded-3xl blur-2xl"></div>
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3]">
                                <Image
                                    src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80"
                                    alt="Sivas Etkinlik Kültürü"
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                            <div className="absolute -bottom-6 -right-6 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-xl flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="block text-2xl font-bold text-white">5000+</span>
                                    <span className="text-sm text-gray-400">Mutlu Katılımcı</span>
                                </div>
                            </div>
                        </div>

                        {/* Text */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                    <Sparkles className="w-8 h-8 text-primary" />
                                    Biz Kimiz?
                                </h2>
                                <div className="space-y-4 text-gray-300 leading-relaxed">
                                    <p>
                                        <strong className="text-white">Sivas Etkinlikleri</strong>, şehrin dinamik yapısını dijital dünyayla buluşturan, kültür ve sanat tutkunlarını bir araya getiren modern bir topluluk platformudur.
                                    </p>
                                    <p>
                                        Amacımız, Sivas'ta gerçekleşen konserlerden tiyatrolara, atölye çalışmalarından doğa gezilerine kadar her türlü etkinliği tek bir çatı altında toplayarak sizlere kolaylık sağlamaktır. Şehrin sosyal hayatına yön veriyor, keşfedilmemiş güzellikleri ve yetenekleri ön plana çıkarıyoruz.
                                    </p>
                                    <p>
                                        Sadece bir bilet satış platformu değil, aynı zamanda sosyalleşebileceğiniz, yeni hobiler edinebileceğiniz ve benzer ilgi alanlarına sahip insanlarla tanışabileceğiniz bir yaşam alanıyız.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="bg-white/5 border border-white/10 p-5 rounded-xl hover:border-primary/30 transition-colors group">
                                    <MapPin className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                                    <h3 className="font-bold text-white mb-1">Yerel Rehber</h3>
                                    <p className="text-sm text-gray-400">Sivas'ın her köşesindeki etkinliklerden anında haberdar olun.</p>
                                </div>
                                <div className="bg-white/5 border border-white/10 p-5 rounded-xl hover:border-primary/30 transition-colors group">
                                    <Heart className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                                    <h3 className="font-bold text-white mb-1">Tutkuyla Bağlı</h3>
                                    <p className="text-sm text-gray-400">Kültür ve sanata olan sevgimizle en nitelikli içerikleri sunuyoruz.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
