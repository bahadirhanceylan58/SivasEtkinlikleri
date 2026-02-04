"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SikcaSorulanSorularPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans">
            <Navbar />

            <div className="container mx-auto px-4 pt-32 pb-12 max-w-4xl">
                <h1 className="text-3xl font-bold text-white mb-8 border-b border-zinc-800 pb-4">Sıkça Sorulan Sorular</h1>

                <div className="space-y-6 text-sm md:text-base leading-relaxed">

                    <FAQItem
                        question="1. Biletlerimi nasıl satın alabilirim?"
                        answer="Web sitemize üye olduktan sonra gitmek istediğiniz etkinliği seçip, &quot;Bilet Al&quot; butonuna tıklayarak güvenli ödeme altyapımız üzerinden kredi kartı veya banka kartınızla biletinizi saniyeler içinde satın alabilirsiniz."
                    />

                    <FAQItem
                        question="2. Satın aldığım biletlerime nasıl ulaşırım?"
                        answer={
                            <span>
                                Satın alma işlemi tamamlandığında biletleriniz kayıtlı e-posta adresinize ve cep telefonunuza SMS olarak gönderilir. Ayrıca sitemize giriş yaptıktan sonra profilinizdeki <strong>"Biletlerim"</strong> sekmesinden tüm biletlerinize her an ulaşabilirsiniz.
                            </span>
                        }
                    />

                    <FAQItem
                        question="3. Biletin çıktısını almam gerekiyor mu?"
                        answer="Hayır, kağıt israfına gerek yok! Etkinlik girişinde, cep telefonunuzdaki QR kodu (Karekod) görevlilere göstermeniz yeterlidir."
                    />

                    <FAQItem
                        question="4. Bilet iadesi yapabilir miyim?"
                        answer={
                            <span>
                                Etkinlik biletleri, "Hizmetin ifasına başlandığı" kategoride olduğu için yasal olarak cayma hakkı kapsamı dışındadır. Bu nedenle, organizatör tarafından etkinlik iptal edilmediği sürece kural olarak <strong>bilet iadesi yapılmamaktadır.</strong>
                                <br /><br />
                                <em>Ancak:</em> Eğer bilet alırken <strong>"İade Garantisi"</strong> hizmetini satın aldıysanız, etkinliğe 24 saat kalana kadar koşulsuz iade talep edebilirsiniz.
                            </span>
                        }
                    />

                    <FAQItem
                        question="5. Etkinlik iptal edilirse ne olur?"
                        answer="Organizasyon firması veya resmi makamlarca etkinliğin iptal edilmesi durumunda, bilet bedeliniz (hizmet bedeli hariç) ödeme yaptığınız karta otomatik olarak iade edilir. İadenin hesabınıza yansıması bankanıza bağlı olarak 3-14 iş günü sürebilir."
                    />

                    <FAQItem
                        question="6. Üyelik ücretli mi?"
                        answer="Hayır, Sivas Etkinlikleri platformuna üye olmak tamamen ücretsizdir. Sadece satın aldığınız etkinlik biletleri için ödeme yaparsınız."
                    />

                    <FAQItem
                        question="7. Ödeme bilgilerim güvende mi?"
                        answer="Kesinlikle. Ödeme işlemleriniz, Türkiye'nin önde gelen ödeme kuruluşları aracılığıyla 256-bit SSL şifreleme teknolojisi ve 3D Secure güvenliği ile gerçekleşir. Kredi kartı bilgileriniz sunucularımızda saklanmaz."
                    />

                    <FAQItem
                        question="8. Organizatör ben değilim, sadece bilet satıyorum. Sorun yaşarsam ne yapmalıyım?"
                        answer={
                            <span>
                                Biz (Sivas Etkinlikleri), etkinlik sahibi ile sizi buluşturan bir aracı platformuz. Etkinlik içeriği, oturma düzeni veya sanatçı ile ilgili konularda sorumluluk Organizatör firmaya aittir. Ancak yaşadığınız her türlü sorunda <strong>destek@sivasetkinlikleri.com</strong> adresinden bize ulaşabilirsiniz; çözüm için elimizden geleni yaparız.
                            </span>
                        }
                    />

                    <FAQItem
                        question="9. Etkinlik saati veya yeri değişebilir mi?"
                        answer="Nadir de olsa organizatörler değişiklik yapabilir. Böyle bir durumda kayıtlı iletişim bilgileriniz (SMS/E-posta) üzerinden anında bilgilendirilirsiniz. Bu yüzden iletişim bilgilerinizin güncel olması önemlidir."
                    />

                </div>
            </div>

            <Footer />
        </div>
    );
}

function FAQItem({ question, answer }: { question: string, answer: React.ReactNode }) {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl hover:border-yellow-500/30 transition-colors">
            <h3 className="text-lg font-bold text-yellow-500 mb-3">{question}</h3>
            <div className="text-gray-400 leading-relaxed">
                {answer}
            </div>
        </div>
    );
}
