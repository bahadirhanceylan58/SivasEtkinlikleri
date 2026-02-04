"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CerezPolitikasiPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans">
            <Navbar />

            <div className="container mx-auto px-4 pt-32 pb-12 max-w-4xl">
                <h1 className="text-3xl font-bold text-white mb-8 border-b border-zinc-800 pb-4">Çerez Politikası</h1>

                <div className="space-y-6 text-sm md:text-base leading-relaxed">

                    <p className="text-lg text-gray-400">
                        <strong>Sivas Etkinlikleri Organizasyon ve Reklam Ajansı</strong> ("Sivas Etkinlikleri") olarak, web sitemiz (www.sivasetkinlikleri.com) ve mobil uygulamamızda çerezler (cookie) kullanmaktayız.
                    </p>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">1. ÇEREZ NEDİR VE NE İŞE YARAR?</h2>
                        <p className="mb-2">Çerezler, ziyaret ettiğiniz internet siteleri tarafından cihazınıza (bilgisayar, telefon vb.) yerleştirilen küçük metin dosyalarıdır.</p>
                        <p className="mb-2">Bu dosyalar şu amaçlarla kullanılır:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Sitenin düzgün çalışması (Oturumunuzun açık kalması, sepetinizdeki ürünlerin hatırlanması).</li>
                            <li>Site performansını analiz edip hizmet kalitesini artırmak.</li>
                            <li>Size özel içerik ve reklamlar sunmak.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">2. KULLANILAN ÇEREZ TÜRLERİ</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Zorunlu Çerezler:</strong> Sitenin çalışması için şarttır (Örn: Giriş yapma, güvenli ödeme). Kapatılamaz.</li>
                            <li><strong>İşlevsel Çerezler:</strong> Tercihlerinizi hatırlar (Örn: Seçtiğiniz şehir, dil ayarı).</li>
                            <li><strong>Analitik Çerezler:</strong> Ziyaretçi sayısını ve siteyi nasıl kullandığınızı analiz eder (Google Analytics vb.).</li>
                            <li><strong>Pazarlama Çerezleri:</strong> İlgi alanlarınıza göre reklam göstermek için kullanılır (Facebook, Google Ads vb.).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">3. VERİLERİN İŞLENME AMACI VE GÜVENLİK</h2>
                        <p>Çerezler aracılığıyla toplanan veriler, 6698 sayılı KVKK’ya uygun olarak işlenir. Verileriniz, sadece hizmet kalitesini artırmak ve yasal yükümlülükleri yerine getirmek amacıyla kullanılır; üçüncü şahıslara satılmaz.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">4. ÇEREZLERİ NASIL YÖNETEBİLİRSİNİZ?</h2>
                        <p>Çoğu tarayıcı çerezleri otomatik kabul eder ancak siz tarayıcı ayarlarınızdan (Chrome, Safari, Firefox vb.) çerezleri engelleyebilir veya silebilirsiniz. Ancak zorunlu çerezleri engellemeniz durumunda sitenin bazı özellikleri (giriş yapma, bilet alma) çalışmayabilir.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">5. İLETİŞİM VE HAKLARINIZ</h2>
                        <p>Kişisel verilerinizle ilgili haklarınızı kullanmak veya soru sormak için <strong>destek@sivasetkinlikleri.com</strong> adresine mail atabilirsiniz.</p>
                    </section>

                    <div className="mt-8 p-4 border border-yellow-500/30 bg-yellow-500/5 rounded-lg text-yellow-200/80 text-sm text-center italic">
                        Bu politika, sitemizde yayınlandığı tarihte yürürlüğe girer.
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}
