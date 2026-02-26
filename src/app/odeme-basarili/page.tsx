"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function OdemeBasariliPage() {
    const router = useRouter();

    useEffect(() => {
        // Otomatik olarak 5 saniye sonra biletlerim sayfasına yönlendir
        const timer = setTimeout(() => {
            router.push("/biletlerim");
        }, 5000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full text-center shadow-xl">
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Ödeme Başarılı!</h1>
                <p className="text-gray-400 mb-8">
                    Biletiniz başarıyla oluşturuldu. Bilet detaylarını "Biletlerim" sayfasından görüntüleyebilirsiniz.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => router.push("/biletlerim")}
                        className="w-full bg-primary hover:bg-yellow-400 text-black font-bold py-3 px-4 rounded-xl transition-colors"
                    >
                        Biletlerime Git
                    </button>
                    <button
                        onClick={() => router.push("/")}
                        className="w-full bg-transparent border border-zinc-700 hover:bg-zinc-800 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                    >
                        Anasayfaya Dön
                    </button>
                </div>

                <p className="text-xs text-gray-500 mt-6 animate-pulse">
                    Yönlendiriliyorsunuz...
                </p>
            </div>
        </div>
    );
}
