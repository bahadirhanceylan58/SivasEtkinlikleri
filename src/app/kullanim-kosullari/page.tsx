"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function KullanimKosullariPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans">
            <Navbar />

            <div className="container mx-auto px-4 pt-32 pb-12 max-w-4xl">
                <h1 className="text-3xl font-bold text-white mb-8 border-b border-zinc-800 pb-4">Kullanım Koşulları</h1>

                <div className="space-y-6 text-sm md:text-base leading-relaxed">

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">1. TARAFLAR VE TANIMLAR</h2>
                        <p>İşbu metin, <strong>Sivas Etkinlikleri Organizasyon ve Reklam Ajansı</strong> ("Platform") ile www.sivasetkinlikleri.com sitesini ("Site") kullanan veya bilet satın alan kişi ("Kullanıcı") arasındaki ilişkiyi düzenler.</p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>Platform:</strong> Sitenin sahibi ve yer sağlayıcısıdır. Etkinlikleri düzenleyen değil, bilet satışına aracılık eden taraftır.</li>
                            <li><strong>Organizatör (Firma):</strong> Etkinliği düzenleyen, içeriğini belirleyen ve ifasından sorumlu olan gerçek veya tüzel kişidir.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">2. ARACI HİZMET SAĞLAYICI BİLGİLERİ</h2>
                        <p>Platform, 6563 sayılı Kanun uyarınca "Aracı Hizmet Sağlayıcı" sıfatını haizdir.</p>
                        <div className="mt-4 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                            <p><strong>Unvan:</strong> Sivas Etkinlikleri Organizasyon ve Reklam Ajansı</p>
                            <p><strong>Adres:</strong> Gültepe Mah. 3. Toptancılar Sk. Maqam İş Merkezi No: 2 İç Kapı No: 401 Merkez/Sivas</p>
                            <p><strong>Vergi Dairesi / No:</strong> Site V.D. - 2070666757</p>
                            <p><strong>E-Posta:</strong> destek@sivasetkinlikleri.com</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">3. HİZMETİN KAPSAMI VE SORUMLULUK SINIRLARI</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Platform, Kullanıcı ile Organizatör’ü bir araya getiren bir pazaryeridir. Satılan biletlerin temsil ettiği etkinliklerin (konser, tiyatro, vb.) düzenleyicisi Platform değildir.</li>
                            <li>Etkinliğin iptali, ertelenmesi, sanatçının gelmemesi, sahne düzeni veya içerik değişikliği gibi durumlardan tamamen <strong>Organizatör</strong> sorumludur. Platform’un bu konularda herhangi bir taahhüdü veya garantisi bulunmamaktadır.</li>
                            <li>Platform, teknik aksaklıklar dışında hizmetin sürekliliğini garanti etmez. Kullanıcı, siteyi hukuka aykırı amaçlarla (bot kullanımı, saldırı vb.) kullanamaz.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">4. SATIŞ, İPTAL VE İADE KOŞULLARI</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Bilet Teslimatı:</strong> Satın alınan biletler dijital ortamda (QR Kod/SMS/E-posta) Kullanıcı’ya iletilir.</li>
                            <li><strong>Cayma Hakkı İstisnası:</strong> 6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği’nin 15/g maddesi uyarınca; belirli bir tarihte veya dönemde yapılması gereken eğlence, dinlenme, kültür ve spor hizmetlerinde <strong>cayma hakkı (sebepsiz iade) geçerli değildir.</strong> Kullanıcı bilet aldıktan sonra "vazgeçtim" diyerek iade talep edemez.</li>
                            <li><strong>Etkinlik İptali:</strong> Etkinlik Organizatör tarafından iptal edilirse, bilet bedeli iadesi Organizatör’ün belirlediği prosedüre göre Platform üzerinden veya doğrudan Organizatör tarafından yapılır. Hizmet bedelleri iade edilmez.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">5. FİKRİ MÜLKİYET</h2>
                        <p>Site üzerindeki tüm yazılım, tasarım, metin ve görsellerin mülkiyeti Platform’a aittir. İzinsiz kopyalanamaz, çoğaltılamaz veya ticari amaçla kullanılamaz.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">6. UYUŞMAZLIKLARIN ÇÖZÜMÜ</h2>
                        <p>İşbu koşullardan doğacak uyuşmazlıklarda, Ticaret Bakanlığı’nca ilan edilen parasal sınırlara göre Kullanıcı’nın yerleşim yerindeki Tüketici Hakem Heyetleri veya Tüketici Mahkemeleri; aksi hallerde <strong>Sivas Mahkemeleri</strong> ve İcra Daireleri yetkilidir.</p>
                    </section>

                    <div className="mt-8 p-4 border border-yellow-500/30 bg-yellow-500/5 rounded-lg text-yellow-200/80 text-sm text-center italic">
                        Kullanıcı, Site üzerinden bilet satın aldığında bu koşulları peşinen kabul etmiş sayılır.
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}
