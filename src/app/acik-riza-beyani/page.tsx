"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function AcikRizaBeyaniPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans">
            <Navbar />

            <div className="container mx-auto px-4 pt-32 pb-12 max-w-4xl">
                <h1 className="text-3xl font-bold text-white mb-8 border-b border-zinc-800 pb-4">Açık Rıza Beyanı</h1>

                <div className="space-y-6 text-sm md:text-base leading-relaxed">

                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg mb-6">
                        <strong className="text-white block mb-2">KİŞİSEL VERİLERİN KORUNMASI KANUNU (KVKK) KAPSAMINDA AÇIK RIZA BEYANI</strong>
                        <p>
                            Sivas Etkinlikleri Organizasyon ve Reklam Ajansı ("Şirket") tarafından, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ve ilgili mevzuat kapsamında, aşağıda belirtilen kişisel verilerimin işlenmesine, saklanmasına ve aktarılmasına ilişkin <strong>Aydınlatma Metni</strong>'ni okudum ve anladım.
                        </p>
                    </div>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">1. İŞLENECEK KİŞİSEL VERİLER</h2>
                        <p className="mb-2">Şirket ile kurduğum üyelik ve hizmet ilişkisi çerçevesinde aşağıdaki verilerimin işlenmesine rıza gösteriyorum:</p>
                        <ul className="list-disc pl-5 space-y-1 text-gray-400">
                            <li><strong className="text-gray-200">Kimlik Bilgileri:</strong> Ad, soyad, doğum tarihi, cinsiyet.</li>
                            <li><strong className="text-gray-200">İletişim Bilgileri:</strong> E-posta adresi, cep telefonu numarası, adres bilgileri.</li>
                            <li><strong className="text-gray-200">İşlem Bilgileri:</strong> Satın alınan etkinlik/bilet detayları, sipariş geçmişi, talep ve şikayet kayıtları.</li>
                            <li><strong className="text-gray-200">Dijital İzler:</strong> IP adresi, site içi gezinme hareketleri, çerez (cookie) kayıtları.</li>
                            <li><strong className="text-gray-200">Pazarlama Verileri:</strong> Kampanya tercihleri, onay verdiğim ticari elektronik ileti izinleri.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">2. VERİLERİN İŞLENME AMAÇLARI</h2>
                        <p className="mb-2">Kişisel verilerimin şu amaçlarla işlenmesini kabul ediyorum:</p>
                        <ul className="list-disc pl-5 space-y-1 text-gray-400">
                            <li>Üyelik işlemlerinin yapılması ve bilet satış hizmetinin gerçekleştirilmesi.</li>
                            <li>Satın alınan biletlerin (QR kod, SMS, E-posta yoluyla) tarafıma iletilmesi.</li>
                            <li>Etkinlik iptali, saat değişikliği gibi zorunlu bilgilendirmelerin yapılması.</li>
                            <li>Bana özel kampanya, indirim ve etkinlik önerilerinin sunulması (Pazarlama izni verdiğim takdirde).</li>
                            <li>Hizmet kalitesinin artırılması, müşteri memnuniyeti analizlerinin yapılması.</li>
                            <li>Yasal mevzuattan kaynaklanan saklama ve raporlama yükümlülüklerinin yerine getirilmesi.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">3. VERİLERİN AKTARIMI</h2>
                        <p className="mb-2">Kişisel verilerimin, hizmetin ifası ve yasal zorunluluklar gereği şu taraflara aktarılmasına onay veriyorum:</p>
                        <ul className="list-disc pl-5 space-y-1 text-gray-400">
                            <li><strong className="text-gray-200">Etkinlik Organizatörleri:</strong> Bilet aldığım etkinliğin giriş kontrollerinin sağlanması amacıyla ilgili organizatör firmaya.</li>
                            <li><strong className="text-gray-200">Hizmet Sağlayıcılar:</strong> SMS/E-posta gönderimi yapan firmalar, ödeme altyapısı sağlayıcıları (Iyzico vb.), sunucu ve bulut hizmeti sağlayıcıları.</li>
                            <li><strong className="text-gray-200">Resmi Kurumlar:</strong> Talep edilmesi halinde Emniyet, Savcılık, Mahkemeler ve diğer yetkili kamu kurumlarına.</li>
                        </ul>
                    </section>

                    <div className="mt-8 p-6 bg-zinc-900 border border-yellow-500/30 rounded-xl">
                        <h3 className="text-lg font-bold text-white mb-3">4. BEYAN VE TAAHHÜT</h3>
                        <p className="italic text-gray-300">
                            Yukarıdaki hususları okuduğumu, anladığımı ve kişisel verilerimin bu kapsamda işlenmesine, saklanmasına ve yurt içi/yurt dışındaki (bulut sunucuları vb.) iş ortaklarına aktarılmasına <strong>özgür irademle, tereddüde yer bırakmayacak şekilde AÇIK RIZA gösterdiğimi</strong> kabul ve beyan ederim.
                        </p>
                    </div>

                    <div className="mt-8 text-center">
                        <Link href="/" className="inline-block px-8 py-3 bg-primary text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors">
                            Anasayfaya Dön
                        </Link>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}
