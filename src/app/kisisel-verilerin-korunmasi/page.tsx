"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function KisiselVerilerinKorunmasiPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans">
            <Navbar />

            <div className="container mx-auto px-4 pt-32 pb-12 max-w-4xl">
                <h1 className="text-3xl font-bold text-white mb-8 border-b border-zinc-800 pb-4">Kişisel Verilerin Korunması ve Aydınlatma Metni</h1>

                <div className="space-y-6 text-sm md:text-base leading-relaxed">

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">1. VERİ SORUMLUSU</h2>
                        <p className="mb-2">6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz; veri sorumlusu olarak <strong>Sivas Etkinlikleri Organizasyon ve Reklam Ajansı</strong> ("Şirket") tarafından aşağıda açıklanan kapsamda işlenebilecektir.</p>
                        <ul className="list-none pl-0 space-y-1 text-gray-400">
                            <li><strong className="text-gray-200">Unvan:</strong> Sivas Etkinlikleri Organizasyon ve Reklam Ajansı</li>
                            <li><strong className="text-gray-200">Adres:</strong> Gültepe Mah. 3. Toptancılar Sk. Maqam İş Merkezi No: 2 İç Kapı No: 401 Merkez/Sivas</li>
                            <li><strong className="text-gray-200">Vergi Dairesi / No:</strong> Site V.D. - 2070666757</li>
                            <li><strong className="text-gray-200">E-Posta:</strong> destek@sivasetkinlikleri.com</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">2. İŞLENEN KİŞİSEL VERİLERİNİZ</h2>
                        <p className="mb-2">Sitemize üye olmanız veya bilet satın almanız durumunda şu verileriniz işlenmektedir:</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-400">
                            <li><strong className="text-gray-200">Kimlik Bilgileri:</strong> Ad, soyad, doğum tarihi, cinsiyet.</li>
                            <li><strong className="text-gray-200">İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, şehir/adres bilgisi.</li>
                            <li><strong className="text-gray-200">Müşteri İşlem Bilgileri:</strong> Satın alınan biletler, sipariş geçmişi, talep ve şikayetler.</li>
                            <li><strong className="text-gray-200">İşlem Güvenliği:</strong> IP adresi, şifre bilgileri, giriş-çıkış kayıtları, çerezler.</li>
                            <li><strong className="text-gray-200">Pazarlama Bilgileri:</strong> (İzin vermeniz halinde) Kampanya tercihleri, anket cevapları.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">3. KİŞİSEL VERİLERİN İŞLENME AMACI</h2>
                        <p className="mb-2">Kişisel verileriniz şu amaçlarla işlenmektedir:</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-400">
                            <li>Üyelik işlemlerinin yapılması ve bilet satış sözleşmesinin ifası.</li>
                            <li>Satın alınan biletlerin tarafınıza (SMS/E-posta) iletilmesi.</li>
                            <li>Yasal fatura kesimi ve vergi mevzuatına uyum.</li>
                            <li>İptal/iade süreçlerinin yönetilmesi ve müşteriye destek sağlanması.</li>
                            <li>Bilgi güvenliği süreçlerinin yürütülmesi (Log kayıtlarının tutulması).</li>
                            <li>Yetkili kamu kurumlarına (Emniyet, Mahkemeler vb.) bilgi verilmesi.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">4. KİŞİSEL VERİLERİN AKTARILMASI</h2>
                        <p className="mb-2">Verileriniz, hizmetin ifası ve yasal zorunluluklar gereği şu taraflara aktarılabilir:</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-400">
                            <li><strong className="text-gray-200">Hizmet Sağlayıcılar:</strong> SMS/E-posta gönderimi yapan firmalar, ödeme altyapısı sağlayıcıları (Iyzico vb.), sunucu hizmeti alınan firmalar.</li>
                            <li><strong className="text-gray-200">Resmi Kurumlar:</strong> Yasal bir talep olması halinde Emniyet Müdürlüğü, Savcılıklar, Mahkemeler.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">5. VERİ TOPLAMANIN YÖNTEMİ VE HUKUKİ SEBEBİ</h2>
                        <p>Kişisel verileriniz, www.sivasetkinlikleri.com sitesi ve mobil uygulaması üzerinden elektronik ortamda otomatik yollarla toplanmaktadır.</p>
                        <p className="mt-2">Bu toplama işlemi KVKK Md. 5'te belirtilen; "Sözleşmenin kurulması veya ifası", "Veri sorumlusunun hukuki yükümlülüğü" ve "İlgili kişinin temel haklarına zarar vermemek kaydıyla veri sorumlusunun meşru menfaati" hukuki sebeplerine dayanmaktadır.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">6. KVKK KAPSAMINDAKİ HAKLARINIZ (MADDE 11)</h2>
                        <p className="mb-2">Herkes, veri sorumlusuna başvurarak kendisiyle ilgili;</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-400">
                            <li>Kişisel veri işlenip işlenmediğini öğrenme,</li>
                            <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme,</li>
                            <li>Kişisel verilerin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                            <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,</li>
                            <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
                            <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme,</li>
                            <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme haklarına sahiptir.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">7. BAŞVURU YÖNTEMİ</h2>
                        <p>Yukarıda belirtilen haklarınızı kullanmak için taleplerinizi yazılı olarak şirket adresimize veya <strong>destek@sivasetkinlikleri.com</strong> e-posta adresine iletebilirsiniz. Başvurularınız en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır.</p>
                    </section>

                </div>
            </div>

            <Footer />
        </div>
    );
}
