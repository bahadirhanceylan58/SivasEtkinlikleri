"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function IadeGarantisiPage() {
    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans">
            <Navbar />

            <div className="container mx-auto px-4 pt-32 pb-12 max-w-4xl">
                <h1 className="text-3xl font-bold text-white mb-8 border-b border-zinc-800 pb-4">İade Garantisi Hizmet Koşulları</h1>

                <div className="space-y-6 text-sm md:text-base leading-relaxed">

                    <p className="text-lg text-gray-400">
                        <strong>Sivas Etkinlikleri Organizasyon ve Reklam Ajansı</strong> ("Sivas Etkinlikleri") tarafından sunulan "İade Garantisi" hizmetinin koşulları aşağıda yer almaktadır. Bu hizmeti satın alarak, bu koşulları kabul etmiş sayılırsınız.
                    </p>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">1. HİZMETİN KAPSAMI VE TANIMI</h2>
                        <p className="mb-2">"İade Garantisi" hizmeti, ek bir ücret karşılığında satın alınarak, etkinlik bilet bedelinin, etkinliğin başlangıç saatine <strong>son 24 saat kalana kadar</strong> herhangi bir gerekçe göstermeksizin iade edilmesini sağlayan bir güvence hizmetidir.</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>İşbu hizmet, yalnızca satın alınan <strong>bilet bedelinin</strong> iadesini kapsar.</li>
                            <li>Etkinliğin organizasyonu, performansı, içeriği veya mekanın kalitesi bu güvencenin kapsamı dışındadır.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">2. HİZMET BEDELİ VE İADE ŞARTLARI</h2>
                        <p className="mb-2">Bu hizmet, Sivas Etkinlikleri tarafından belirlenen etkinliklerde sunulmakta olup, bedeli bilet alım işlemi sırasında açıkça gösterilir.</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Önemli:</strong> İade Garantisi hizmeti kullanıldığında, müşteriye <strong>sadece bilet bedeli</strong> iade edilir.</li>
                            <li>Bilet alımı sırasında ödenen <strong>"Hizmet Bedeli"</strong> ve <strong>"İade Garantisi Bedeli"</strong> iade kapsamına dahil değildir ve müşteriye geri ödenmez.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">3. İADE TALEBİ VE SÜRECİ</h2>
                        <p className="mb-2">Bilet iade talebi, etkinliğin başlama saatinden <strong>en geç 24 saat öncesine kadar</strong> tarafımıza iletilmelidir.</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Başvuru Kanalı:</strong> İade taleplerinizi <strong>destek@sivasetkinlikleri.com</strong> adresine e-posta göndererek yapabilirsiniz.</li>
                            <li>Belirtilen süre (son 24 saat) geçtikten sonra yapılan talepler işleme alınmayacaktır.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">4. PARA İADESİ İŞLEMİ</h2>
                        <p className="mb-2">İade talebinin onaylanmasının ardından:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Tutar, ödemenin yapıldığı banka hesabına veya kredi kartına iade edilir.</li>
                            <li>İadenin hesaba yansıması, banka süreçlerine bağlı olarak <strong>3 ila 20 iş günü</strong> sürebilir.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-yellow-500 mb-2">5. HİZMETİN GEÇERSİZ OLDUĞU DURUMLAR (İSTİSNALAR)</h2>
                        <p className="mb-2">Aşağıdaki durumlarda İade Garantisi geçersizdir ve ödeme yapılmaz:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>İade talebinin, etkinliğe <strong>24 saatten az bir süre kala</strong> yapılması.</li>
                            <li>Biletin sahte olması veya üzerinde oynama yapılması.</li>
                            <li>Biletin üçüncü bir kişiye devredilmiş olması.</li>
                            <li><strong>Organizatör İptalleri:</strong> Etkinliğin, organizatör veya resmi makamlar tarafından (doğal afet, sanatçı iptali vb.) iptal edilmesi durumunda bu "İade Garantisi" değil, genel iptal/iade prosedürleri devreye girer. Bu durumda iade süreçleri organizatörün kararlarına göre yönetilir.</li>
                        </ul>
                    </section>

                </div>
            </div>

            <Footer />
        </div>
    );
}
