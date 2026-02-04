"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Sayfa yüklendiğinde kullanıcının daha önce kabul edip etmediğine bak
        const consent = localStorage.getItem("cookieConsent");
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem("cookieConsent", "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-zinc-900 border-t border-zinc-800 p-4 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-gray-300 text-sm text-center md:text-left">
                    Size daha iyi hizmet sunmak için çerezleri kullanıyoruz. Detaylı bilgi için{" "}
                    <Link href="/cerez-politikasi" className="text-yellow-500 hover:text-yellow-400 font-medium underline decoration-yellow-500/30 underline-offset-4 hover:decoration-yellow-400 transition-all">
                        Çerez Politikamızı
                    </Link>{" "}
                    inceleyebilirsiniz.
                </p>
                <button
                    onClick={acceptCookies}
                    className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors text-sm whitespace-nowrap shadow-md hover:shadow-yellow-500/20"
                >
                    Kabul Et
                </button>
            </div>
        </div>
    );
}
