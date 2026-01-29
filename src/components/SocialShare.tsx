"use client";

import { Share2, MessageCircle, Send, Instagram, Facebook } from 'lucide-react';
import { useState } from 'react';

interface SocialShareProps {
    eventTitle: string;
    eventUrl: string;
    eventImage?: string;
}

export default function SocialShare({ eventTitle, eventUrl }: SocialShareProps) {
    const [copied, setCopied] = useState(false);

    const shareText = `${eventTitle} - Etkinliğe katılmak için: ${eventUrl}`;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(eventUrl);

    const socialLinks = {
        whatsapp: `https://wa.me/?text=${encodedText}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(eventTitle)}&url=${encodedUrl}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(eventTitle)}`,
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(eventUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            alert('Link kopyalanamadı!');
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: eventTitle,
                    url: eventUrl,
                });
            } catch (err) {
                // Share cancelled
            }
        } else {
            handleCopyLink();
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {/* WhatsApp */}
            <a
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all font-medium text-sm flex-1 justify-center min-w-[100px]"
            >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
            </a>

            {/* Facebook */}
            <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium text-sm flex-1 justify-center min-w-[100px]"
            >
                <Facebook className="w-4 h-4" />
                <span>Facebook</span>
            </a>

            {/* Twitter */}
            <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-black hover:bg-gray-900 text-white rounded-lg transition-all font-medium text-sm flex-1 justify-center min-w-[100px]"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Twitter</span>
            </a>

            {/* Telegram */}
            <a
                href={socialLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all font-medium text-sm flex-1 justify-center min-w-[100px]"
            >
                <Send className="w-4 h-4" />
                <span>Telegram</span>
            </a>

            {/* Instagram */}
            <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500 hover:opacity-90 text-white rounded-lg transition-all font-medium text-sm flex-1 justify-center min-w-[100px]"
            >
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
            </button>

            {/* Other */}
            <button
                onClick={handleNativeShare}
                className="flex items-center gap-2 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-all font-medium text-sm flex-1 justify-center min-w-[100px]"
            >
                <Share2 className="w-4 h-4" />
                <span>{copied ? 'Kopyalandı' : 'Diğer'}</span>
            </button>
        </div>
    );
}
