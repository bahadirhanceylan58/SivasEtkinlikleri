"use client";

import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIosDevice);

        // Handle install prompt for Android/Desktop
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Check if user has already dismissed it recently
            const hasDismissed = localStorage.getItem('pwa_prompt_dismissed');
            if (!hasDismissed) {
                setIsVisible(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Show for iOS if not standalone (and not dismissed)
        if (isIosDevice && !(window.navigator as any).standalone) {
            const hasDismissed = localStorage.getItem('pwa_prompt_dismissed');
            if (!hasDismissed) {
                setIsVisible(true);
            }
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        // Hide for 7 days
        // localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
        // For testing, just session dismissal or standard logic suitable for demo:
        localStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border border-primary/20 p-4 rounded-xl shadow-2xl z-[9999] animate-slideInUp">
            <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1"
                aria-label="Kapat"
                title="Kapat"
            >
                <X size={16} />
            </button>

            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-primary/20">
                    S
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-foreground">Uygulamayı Yükle</h3>
                    <p className="text-xs text-muted-foreground">Daha hızlı erişim ve bildirimler için.</p>
                </div>
            </div>

            <div className="mt-4">
                {isIOS ? (
                    <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        <p className="mb-2">Yüklemek için:</p>
                        <div className="flex items-center gap-2">
                            1. <Share size={16} /> butonuna tıklayın
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            2. "Ana Ekrana Ekle"yi seçin
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleInstallClick}
                        className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        Yükle
                    </button>
                )}
            </div>
        </div>
    );
}
