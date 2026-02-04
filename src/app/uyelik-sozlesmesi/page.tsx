"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function UyelikSozlesmesiPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans">
            <Navbar />

            <div className="container mx-auto px-4 pt-32 pb-12 max-w-4xl">
                <h1 className="text-3xl font-bold text-white mb-8 border-b border-zinc-800 pb-4">Üyelik Sözleşmesi</h1>

                <div className="space-y-6 text-sm md:text-base leading-relaxed">

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">1. TARAFLAR</h2>
                        <p>İşbu Üyelik Sözleşmesi ("Sözleşme"), <strong>Sivas Etkinlikleri Organizasyon ve Reklam Ajansı</strong> ("SivasEtkinlikleri") ile www.sivasetkinlikleri.com ("Site") adresine üye olan kullanıcı ("Üye") arasında akdedilmiştir.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">2. KONU</h2>
                        <p>İşbu Sözleşme’nin konusu, Üye’nin Site üzerindeki hizmetlerden yararlanma şartlarının ve tarafların hak ve yükümlülüklerinin belirlenmesidir. SivasEtkinlikleri, etkinlik düzenleyen firmalar ile Üye’yi bir araya getiren bir platformdur; etkinliklerin düzenleyicisi değil, bilet satış aracısıdır.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">3. ÜYELİK ŞARTLARI VE GÜVENLİK</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Doğru Bilgi:</strong> Üye, kayıt formunda verdiği bilgilerin (Ad, Soyad, İletişim vb.) doğru ve güncel olduğunu taahhüt eder. Yanlış bilgi verilmesinden doğacak zararlardan Üye sorumludur.</li>
                            <li><strong>Şifre Güvenliği:</strong> Üyelik şifresinin güvenliği bizzat Üye’ye aittir. Şifrenin üçüncü kişilerle paylaşılması veya çalınması durumunda SivasEtkinlikleri sorumlu tutulamaz.</li>
                            <li><strong>Devir Yasağı:</strong> Üyelik hesabı kişiye özeldir, başkasına devredilemez veya kullandırılamaz.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">4. HAK VE YÜKÜMLÜLÜKLER</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Kişisel Kullanım:</strong> Site üzerindeki içerikler (metin, görsel, biletler) sadece kişisel kullanım içindir. Ticari amaçla kopyalanamaz, satılamaz.</li>
                            <li><strong>Yasaklı Eylemler:</strong> Site güvenliğini tehdit edecek yazılımlar kullanmak, bot ile işlem yapmak veya diğer üyelerin bilgilerine erişmeye çalışmak yasaktır. Tespiti halinde üyelik iptal edilir ve yasal işlem başlatılır.</li>
                            <li><strong>Yaş Sınırı:</strong> Üye, 18 yaşından büyük olduğunu beyan eder. 18 yaşından küçükler Site’ye üye olamaz.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">5. GİZLİLİK VE KVKK</h2>
                        <p>Üye, Site’ye kaydolarak kişisel verilerinin "Kişisel Verilerin Korunması Hakkında Aydınlatma Metni" kapsamında işlenmesine, saklanmasına ve hizmetin ifası için iş ortaklarıyla paylaşılmasına onay vermiş sayılır.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">6. SÖZLEŞMENİN FESHİ</h2>
                        <p>SivasEtkinlikleri, Üye’nin sözleşmeye aykırı hareket ettiğini tespit etmesi durumunda, herhangi bir ihtara gerek kalmaksızın üyeliği askıya alma veya kalıcı olarak silme hakkına sahiptir. Üye, dilediği zaman üyeliğini iptal edebilir.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">7. SORUMLULUK SINIRLARI</h2>
                        <p>SivasEtkinlikleri, aracı hizmet sağlayıcı konumundadır. Etkinliğin iptali, içeriği, saati veya organizatörden kaynaklı kusurlardan dolayı SivasEtkinlikleri sorumlu tutulamaz.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">8. DELİL SÖZLEŞMESİ VE YETKİLİ MAHKEME</h2>
                        <p>İşbu sözleşmeden doğacak ihtilaflarda SivasEtkinlikleri’nin veritabanı ve sunucu kayıtları kesin delil teşkil eder. Uyuşmazlıkların çözümünde <strong>Sivas Mahkemeleri ve İcra Daireleri</strong> yetkilidir.</p>
                    </section>

                    <div className="mt-8 p-4 border border-yellow-500/30 bg-yellow-500/5 rounded-lg text-yellow-200/80 text-sm text-center italic">
                        Üye, üyelik işlemini tamamladığında bu sözleşmenin tüm maddelerini okuduğunu ve kabul ettiğini beyan eder.
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}
