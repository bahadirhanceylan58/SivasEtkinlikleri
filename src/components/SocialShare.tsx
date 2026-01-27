"use client";

import { Share2, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';

interface SocialShareProps {
    eventTitle: string;
    eventUrl: string;
    eventImage?: string;
}

export default function SocialShare({ eventTitle, eventUrl, eventImage }: SocialShareProps) {
    const [copied, setCopied] = useState(false);

    const shareText = `${eventTitle} - Etkinliğe katılmak için: ${eventUrl}`;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(eventUrl);

    const socialLinks = {
        whatsapp: `https://wa.me/?text=${encodedText}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(eventTitle)}&url=${encodedUrl}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(eventTitle)}`,
        // Instagram doesn't support direct web sharing, so we copy link
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
                console.log('Share cancelled');
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
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all font-medium"
            >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Twitter */}
            <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all font-medium"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span className="hidden sm:inline">Twitter</span>
            </a>

            {/* Telegram */}
            <a
                href={socialLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg transition-all font-medium"
            >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Telegram</span>
            </a>

            {/* Copy Link / Native Share */}
            <button
                onClick={handleNativeShare}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-all font-medium"
            >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">
                    {copied ? 'Kopyalandı!' : 'Paylaş'}
                </span>
            </button>
        </div>
    );
}
