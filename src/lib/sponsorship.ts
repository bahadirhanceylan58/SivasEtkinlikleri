import { SponsorshipTier, Sponsor } from '@/types/ticketing';

/**
 * Varsayılan sponsorluk tier'ları
 */
export const DEFAULT_SPONSORSHIP_TIERS: SponsorshipTier[] = [
    {
        id: 'bronze',
        name: 'Bronz',
        amount: 500,
        benefits: [
            'Küçük logo gösterimi',
            'Etkinlik sayfasında isim',
            'Teşekkür mesajı',
            'Sosyal medya paylaşımı'
        ],
        color: '#CD7F32',
        icon: '🥉'
    },
    {
        id: 'silver',
        name: 'Gümüş',
        amount: 1000,
        benefits: [
            'Orta boy logo gösterimi',
            'Öne çıkan yerleşim',
            'Website linki',
            'Sosyal medya özel paylaşım',
            'Bronz avantajları'
        ],
        color: '#C0C0C0',
        icon: '🥈'
    },
    {
        id: 'gold',
        name: 'Altın',
        amount: 2500,
        benefits: [
            'Büyük logo gösterimi',
            'Premium yerleşim',
            'Özel teşekkür mesajı',
            'Sosyal medya kampanyası',
            'Etkinlik materyallerinde logo',
            'Gümüş avantajları'
        ],
        color: '#FFD700',
        icon: '🥇'
    },
    {
        id: 'platinum',
        name: 'Platin',
        amount: 5000,
        benefits: [
            'En büyük logo gösterimi',
            'En üst sırada yerleşim',
            'Özel duyuru ve tanıtım',
            'VIP etkinlik erişimi',
            'Medya görünürlüğü',
            'Tüm avantajlar'
        ],
        color: '#E5E4E2',
        icon: '💎'
    }
];

/**
 * Tier bilgisini döndürür
 */
export function getTierById(tierId: string): SponsorshipTier | undefined {
    return DEFAULT_SPONSORSHIP_TIERS.find(tier => tier.id === tierId);
}

/**
 * Sponsorları tier'a göre sıralar
 */
export function sortSponsorsByTier(sponsors: Sponsor[]): Sponsor[] {
    const tierOrder = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

    return [...sponsors].sort((a, b) => {
        const orderA = tierOrder[a.tier as keyof typeof tierOrder] ?? 999;
        const orderB = tierOrder[b.tier as keyof typeof tierOrder] ?? 999;
        return orderA - orderB;
    });
}

/**
 * Tier'a göre logo boyutu sınıfını döndürür
 */
export function getLogoSizeClass(tier: string): string {
    const sizes: Record<string, string> = {
        platinum: 'w-40 h-40 md:w-48 md:h-48',
        gold: 'w-32 h-32 md:w-40 md:h-40',
        silver: 'w-24 h-24 md:w-32 md:h-32',
        bronze: 'w-20 h-20 md:w-24 md:h-24'
    };

    return sizes[tier] || sizes.bronze;
}

/**
 * Tier'a göre sponsorları grupla
 */
export function groupSponsorsByTier(sponsors: Sponsor[]): Record<string, Sponsor[]> {
    return sponsors.reduce((acc, sponsor) => {
        const tier = sponsor.tier;
        if (!acc[tier]) {
            acc[tier] = [];
        }
        acc[tier].push(sponsor);
        return acc;
    }, {} as Record<string, Sponsor[]>);
}
