"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SozlesmePage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans">
            <Navbar />

            <div className="container mx-auto px-4 pt-32 pb-12 max-w-4xl">
                <h1 className="text-3xl font-bold text-white mb-8 border-b border-zinc-800 pb-4">Kullanıcı Sözleşmesi</h1>

                <div className="space-y-6 text-sm md:text-base leading-relaxed">

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">1. TARAFLAR</h2>
                        <p>İşbu sözleşme, <strong>SivasEtkinlikleri Organizasyon ve Reklam Ajansı</strong> (bundan böyle “Platform” olarak anılacaktır) ile siteye/uygulamaya üye olan veya hizmetlerden faydalanan kullanıcı (“Kullanıcı”) arasında akdedilmiştir. Kullanıcı, siteye üye olarak veya bilet satın alarak bu sözleşme hükümlerini peşinen kabul etmiş sayılır.</p>
                        <div className="mt-4 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                            <p><strong>Unvan:</strong> SivasEtkinlikleri Organizasyon ve Reklam Ajansı</p>
                            <p><strong>Adres:</strong> Gültepe Mah. 3. Toptancılar Sk. Maqam İş Merkezi No: 2 İç Kapı No: 401 Merkez/Sivas</p>
                            <p><strong>Vergi Dairesi / No:</strong> Site V.D. - 2070666757</p>
                            <p><strong>E-Posta:</strong> destek@sivasetkinlikleri.com</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">2. HİZMETİN KAPSAMI VE SORUMLULUK</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Aracı Statüsü:</strong> Platform, etkinlik düzenleyen firmalar (“Organizatör”) ile Kullanıcı’yı bir araya getiren bir pazaryeri/aracı hizmet sağlayıcıdır.</li>
                            <li><strong>Sorumluluk Sınırı:</strong> Satışa sunulan etkinliklerin (konser, tiyatro, spor vb.) düzenlenmesi, içeriği, fiyatlandırması, tarih değişikliği veya iptali tamamen Organizatör’ün sorumluluğundadır. Platform, hizmetin sağlayıcısı değildir; sadece bilet satışına aracılık eder. Etkinliklerde yaşanabilecek aksaklıklardan Platform sorumlu tutulamaz.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">3. ÜYELİK VE KULLANIM ŞARTLARI</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Doğru Bilgi:</strong> Kullanıcı, üyelik ve satın alma sırasında verdiği bilgilerin doğru ve güncel olduğunu taahhüt eder. Yanlış bilgi kaynaklı sorunlardan (biletin ulaşmaması vb.) Kullanıcı sorumludur.</li>
                            <li><strong>Hesap Güvenliği:</strong> Üyelik şifresinin güvenliği Kullanıcı’ya aittir. Hesap üzerinden yapılan tüm işlemlerden Kullanıcı sorumludur.</li>
                            <li><strong>Yasaklı İşlemler:</strong> Sitenin güvenliğini tehdit etmek, bot yazılımlar kullanmak veya biletleri karaborsa/ticari amaçla tekrar satmak yasaktır. Tespiti halinde üyelik iptal edilir ve yasal işlem başlatılır.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">4. İPTAL, İADE VE CAYMA HAKKI</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Cayma Hakkı İstisnası:</strong> 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği’nin 15. maddesi uyarınca; belirli bir tarihte veya dönemde yapılması gereken eğlence, dinlenme, kültür ve spor hizmetlerinde (bilet satışlarında) <strong>cayma hakkı geçerli değildir.</strong></li>
                            <li><strong>İptal Durumu:</strong> Etkinlik, Organizatör tarafından iptal edilmediği sürece bilet iadesi yapılmaz. Organizatör tarafından iptal edilen etkinliklerde, iade prosedürü Organizatör’ün belirlediği şartlara göre Platform üzerinden veya doğrudan Organizatör tarafından yapılır. Hizmet bedelleri iade edilmez.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">5. FİKRİ MÜLKİYET</h2>
                        <p>Platform üzerindeki tüm yazılım, tasarım, logo ve içeriklerin mülkiyeti <strong>SivasEtkinlikleri Organizasyon ve Reklam Ajansı</strong>’na aittir. İzinsiz kopyalanamaz ve ticari amaçla kullanılamaz.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">6. İLETİŞİM İZNİ</h2>
                        <p>Kullanıcı, Platform’un kendisine bilet detayları, kampanya bilgilendirmeleri ve zorunlu haller (iptal/değişiklik) için SMS ve E-posta göndermesine onay verir.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">7. UYUŞMAZLIKLAR</h2>
                        <p>İşbu sözleşmeden doğacak uyuşmazlıklarda <strong>Sivas</strong> Mahkemeleri ve İcra Daireleri yetkilidir.</p>
                    </section>

                </div>
            </div>

            <Footer />
        </div>
    );
}
