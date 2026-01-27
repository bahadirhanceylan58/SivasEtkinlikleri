import { GroupTicketTier } from '@/types/ticketing';

/**
 * Grup bilet indirimini hesaplar
 */
export function calculateGroupDiscount(
    basePrice: number,
    quantity: number,
    groupTiers: GroupTicketTier[]
): {
    discount: number;
    discountPercentage: number;
    finalPrice: number;
    appliedTier: GroupTicketTier | null;
} {
    if (!groupTiers || groupTiers.length === 0 || quantity < 1) {
        return {
            discount: 0,
            discountPercentage: 0,
            finalPrice: basePrice * quantity,
            appliedTier: null
        };
    }

    // En yüksek indirimi veren tier'ı bul
    const applicableTier = groupTiers
        .filter(tier => quantity >= tier.minTickets)
        .sort((a, b) => b.discount - a.discount)[0];

    if (!applicableTier) {
        return {
            discount: 0,
            discountPercentage: 0,
            finalPrice: basePrice * quantity,
            appliedTier: null
        };
    }

    const subtotal = basePrice * quantity;
    const discountAmount = subtotal * applicableTier.discount;
    const finalPrice = subtotal - discountAmount;

    return {
        discount: Math.round(discountAmount * 100) / 100,
        discountPercentage: applicableTier.discount * 100,
        finalPrice: Math.round(finalPrice * 100) / 100,
        appliedTier: applicableTier
    };
}

/**
 * Bir sonraki tier'a ulaşmak için kaç bilet daha gerektiğini hesaplar
 */
export function getNextTierInfo(
    currentQuantity: number,
    groupTiers: GroupTicketTier[]
): {
    hasNextTier: boolean;
    nextTier: GroupTicketTier | null;
    ticketsNeeded: number;
} {
    if (!groupTiers || groupTiers.length === 0) {
        return {
            hasNextTier: false,
            nextTier: null,
            ticketsNeeded: 0
        };
    }

    // Mevcut quantity'den büyük en küçük tier'ı bul
    const sortedTiers = [...groupTiers].sort((a, b) => a.minTickets - b.minTickets);
    const nextTier = sortedTiers.find(tier => tier.minTickets > currentQuantity);

    if (!nextTier) {
        return {
            hasNextTier: false,
            nextTier: null,
            ticketsNeeded: 0
        };
    }

    return {
        hasNextTier: true,
        nextTier: nextTier,
        ticketsNeeded: nextTier.minTickets - currentQuantity
    };
}

/**
 * Tüm tier'ları formatted olarak döndürür (UI için)
 */
export function formatGroupTiers(tiers: GroupTicketTier[]): string {
    if (!tiers || tiers.length === 0) return '';

    return tiers
        .sort((a, b) => a.minTickets - b.minTickets)
        .map(tier => `${tier.minTickets}+ bilet: %${tier.discount * 100} indirim`)
        .join(' • ');
}
