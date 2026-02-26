"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

export default function OdemeBasarisizPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full text-center shadow-xl">
                <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle size={40} />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Ödeme Başarısız!</h1>
                <p className="text-gray-400 mb-8">
                    Ödeme işlemi gerçekleştirilemedi. Kart bilgilerinizde bir sorun olabilir veya işleminiz bankanız tarafından reddedilmiş olabilir.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => router.back()}
                        className="w-full bg-primary hover:bg-yellow-400 text-black font-bold py-3 px-4 rounded-xl transition-colors"
                    >
                        Tekrar Dene
                    </button>
                    <button
                        onClick={() => router.push("/")}
                        className="w-full bg-transparent border border-zinc-700 hover:bg-zinc-800 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                    >
                        Anasayfaya Dön
                    </button>
                </div>
            </div>
        </div>
    );
}
