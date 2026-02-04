"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function GizlilikPolitikasiPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans">
            <Navbar />

            <div className="container mx-auto px-4 pt-32 pb-12 max-w-4xl">
                <h1 className="text-3xl font-bold text-white mb-8 border-b border-zinc-800 pb-4">Gizlilik Politikası</h1>

                <div className="space-y-6 text-sm md:text-base leading-relaxed">

                    <p className="text-lg text-gray-400">
                        <strong>Sivas Etkinlikleri Organizasyon ve Reklam Ajansı</strong> ("Sivas Etkinlikleri") olarak, müşterilerimizin kişisel verilerinin gizliliğine ve güvenliğine büyük önem vermekteyiz. Aşağıdaki maddeler, sitemizde toplanan bilgilerin nasıl kullanıldığını ve korunduğunu açıklamaktadır.
                    </p>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">1. VERİLERİN TOPLANMASI VE KULLANIMI</h2>
                        <p className="mb-2">Hizmetlerimizi sunabilmek amacıyla isim, soyisim, telefon, e-posta gibi bazı kişisel bilgilerinizi talep etmekteyiz. Bu veriler, 6698 sayılı <strong>Kişisel Verilerin Korunması Kanunu (KVKK)</strong> çerçevesinde işlenmektedir.</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Toplanan bilgiler; biletleme işlemlerini gerçekleştirmek, dönemsel kampanyalardan haberdar etmek ve müşteri profillerini sınıflandırmak amacıyla kullanılır.</li>
                            <li>Sivas Etkinlikleri, üyelik formlarından topladığı bilgileri, kullanıcının haberi olmaksızın üçüncü şahıslarla <strong>kesinlikle paylaşmamakta</strong>, faaliyet dışı hiçbir nedenle ticari amaçla kullanmamakta ve <strong>satmamaktadır.</strong></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">2. KREDİ KARTI GÜVENLİĞİ</h2>
                        <p className="mb-2">Sitemizden güvenle alışveriş yapabilirsiniz.</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Ödeme sayfasında istenen kredi kartı bilgileriniz, güvenliğinizi en üst seviyede tutmak amacıyla <strong>hiçbir şekilde Sivas Etkinlikleri sunucularında tutulmamaktadır.</strong></li>
                            <li>Ödeme işlemleri, bilgisayarınız ile banka/ödeme kuruluşu arasında şifreli (SSL) bir bağlantı üzerinden doğrudan gerçekleşir.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">3. İLETİŞİM İZİNLERİ VE BİLDİRİMLER</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Bilet Bildirimleri:</strong> Satın aldığınız etkinliğe ait bilet kodları ve hizmet detayları, kayıtlı e-posta adresinize ve telefonunuza gönderilir. Bu bildirimler hizmetin bir parçasıdır.</li>
                            <li><strong>Kampanya Duyuruları:</strong> Kullanıcılarımız, yeni etkinlik ve fırsatlardan haberdar olmak istemezlerse, diledikleri zaman <strong>destek@sivasetkinlikleri.com</strong> adresine mail atarak veya gelen iletideki linki kullanarak bu listeden çıkabilirler.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">4. ÜÇÜNCÜ TARAFLAR VE LİNKLER</h2>
                        <p>Sitemizden başka web sitelerine link verilebilir. Sivas Etkinlikleri, bu sitelerin gizlilik politikalarından ve içeriklerinden sorumlu değildir.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">5. RESMİ MAKAMLARLA PAYLAŞIM</h2>
                        <p>Kullanıcı bilgileri, ancak resmi makamlarca usulüne uygun şekilde talep edilmesi halinde ve yürürlükteki emredici mevzuat hükümleri gereğince resmi makamlara açıklanabilir.</p>
                    </section>

                    <div className="mt-8 p-4 border border-yellow-500/30 bg-yellow-500/5 rounded-lg text-yellow-200/80 text-sm text-center italic">
                        Sitemizi kullanarak bu Gizlilik Politikasını kabul etmiş sayılırsınız.
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}
