"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function EtkinlikPanelPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans">
            <Navbar />

            <div className="container mx-auto px-4 pt-32 pb-12 max-w-4xl">
                <h1 className="text-3xl font-bold text-white mb-8 border-b border-zinc-800 pb-4">Etkinlik Panel Gizlilik Politikası</h1>

                <div className="space-y-6 text-sm md:text-base leading-relaxed">

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">1. GİZLİLİK VE VERİ KULLANIMI</h2>
                        <p className="mb-2">Sivas Etkinlikleri Organizasyon ve Reklam Ajansı ("Sivas Etkinlikleri"), etkinlik organizatörlerine (tedarikçilerine) daha iyi hizmet verebilmek amacıyla bazı kişisel bilgilerinizi (isim, yaş, ilgi alanlarınız, e-posta vb.) talep etmektedir.</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-400">
                            <li><strong>Sivas Etkinlikleri Panel</strong> veritabanında toplanan bu bilgiler; dönemsel kampanya çalışmaları ve müşteri profillerine yönelik özel promosyon faaliyetlerinin kurgulanmasında sadece kurum bünyesinde kullanılmaktadır.</li>
                            <li>Toplanan bilgiler, üyenin haberi ya da aksi bir talimatı olmaksızın, üçüncü şahıslarla <strong>kesinlikle paylaşılmamakta</strong>, faaliyet dışı hiçbir nedenle ticari amaçla kullanılmamakta ve satılmamaktadır.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">2. VERİ ANALİZİ VE İŞ ORTAKLARI</h2>
                        <p>Site kullanımı sırasındaki ziyaretçi hareketleri ve tercihleri analiz edilerek yorumlanmaktadır. Kişisel bilgiler içermeyen bu istatistiksel veriler, daha özel ve etkin bir deneyim yaşatmak amacıyla güvenilir iş ortakları ile paylaşılabilir. Bu politikayı kabul etmekle, istatistiksel verilerin iş ortakları ile paylaşılabileceğine onay vermiş sayılırsınız.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">3. İLETİŞİM VE KAMPANYALAR</h2>
                        <p className="mb-2">Sistemimizdeki kullanıcı bilgileri, iletişim kampanyaları (e-posta, bülten vb.) dahilinde bilgi vermek amacıyla kullanılabilir.</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-400">
                            <li>Bu tanıtımlardan haberdar olmak istemezseniz, <strong>destek@sivasetkinlikleri.com</strong> adresine e-posta göndererek bu aktiviteyi durdurabilirsiniz.</li>
                            <li>Sitemize üye olurken verdiğiniz e-posta adresinin doğruluğunu, bu beyanı kabul etmekle teyit etmiş sayılırsınız.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">4. VERİ GÜVENLİĞİ VE ERİŞİM</h2>
                        <p>Müşterinin sisteme girdiği tüm bilgilere <strong>sadece Müşteri ulaşabilmekte</strong> ve bu bilgileri sadece Müşteri değiştirebilmektedir. Başkasının bu bilgilere ulaşması ve değiştirmesi mümkün değildir.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">5. ÖDEME VE KREDİ KARTI GÜVENLİĞİ</h2>
                        <p className="mb-2">Kullanıcılarımızın satın alma işlemi sırasında verdiği bilgiler, kişilerin izni olmadıkça 3. şahıslarla paylaşılmaz.</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-400">
                            <li>Ödeme sayfasında istenen kredi kartı bilgileriniz, güvenliğinizi en üst seviyede tutmak amacıyla <strong>hiçbir şekilde Sivas Etkinlikleri sunucularında tutulmamaktadır.</strong></li>
                            <li>Ödeme işlemleri, panel arayüzü üzerinden banka ve bilgisayarınız arasında şifreli bir şekilde (SSL) gerçekleşir. Kredi kartı numarası, CVC2 vb. bilgiler sistemimizde saklanmaz.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">6. YASAL ZORUNLULUKLAR</h2>
                        <p>Müşteri bilgileri, ancak resmi makamlarca usulüne uygun şekilde talep edilmesi halinde ve yürürlükteki emredici mevzuat hükümleri gereğince resmi makamlara açıklanabilir.</p>
                    </section>

                    <div className="mt-8 p-4 border border-yellow-500/30 bg-yellow-500/5 rounded-lg text-yellow-200/80 text-sm text-center italic">
                        Sivas Etkinlikleri Panelini kullanarak bu koşulları kabul etmiş sayılırsınız.
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}
