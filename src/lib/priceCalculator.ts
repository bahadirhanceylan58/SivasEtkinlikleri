/**
 * Gelişmiş fiyat hesaplama motoru
 * Grup indirimi, indirim kodu ve koltuk seçimini kombine eder
 */
interface PriceCalculation {
    subtotal: number;
    groupDiscount: number;
    groupDiscountPercentage: number;
    codeDiscount: number;
    total: number;
    itemCount: number;
}

interface Seat {
    row: string;
    number: number;
    price?: number;
}

interface GroupTier {
    minTickets: number;
    discount: number;
}

interface Discount {
    valid: boolean;
    type?: 'percentage' | 'fixed';
    value?: number;
    discountAmount?: number;
}

export function calculateFinalPrice(
    ticketPrice: number,
    ticketCount: number,
    hasSeatSelection: boolean,
    selectedSeats: string[],
    seats: Seat[],
    groupTiers: GroupTier[],
    appliedDiscount: Discount | null
): PriceCalculation {
    let subtotal = 0;
    let itemCount = 0;

    // 1. Temel fiyat hesapla
    if (hasSeatSelection && selectedSeats.length > 0) {
        // Koltuk bazlı fiyatlama
        selectedSeats.forEach(seatId => {
            const parsed = seatId.match(/^([A-Z])(\d+)$/);
            if (parsed) {
                const seat = seats.find(s => s.row === parsed[1] && s.number === parseInt(parsed[2]));
                subtotal += seat?.price || ticketPrice;
            }
        });
        itemCount = selectedSeats.length;
    } else {
        // Normal bilet sayısı
        subtotal = ticketPrice * ticketCount;
        itemCount = ticketCount;
    }

    // 2. Grup indirimi hesapla
    let groupDiscount = 0;
    let groupDiscountPercentage = 0;

    if (!hasSeatSelection && groupTiers.length > 0) {
        const applicableTier = groupTiers
            .filter(tier => itemCount >= tier.minTickets)
            .sort((a, b) => b.discount - a.discount)[0];

        if (applicableTier) {
            groupDiscount = Math.round(subtotal * applicableTier.discount * 100) / 100;
            groupDiscountPercentage = applicableTier.discount * 100;
        }
    }

    let total = subtotal - groupDiscount;

    // 3. İndirim kodu uygula (grup indiriminden sonra)
    let codeDiscount = 0;
    if (appliedDiscount?.valid && appliedDiscount.discountAmount) {
        if (appliedDiscount.type === 'percentage') {
            codeDiscount = Math.round(total * ((appliedDiscount.value || 0) / 100) * 100) / 100;
        } else {
            codeDiscount = appliedDiscount.discountAmount;
        }
        total -= codeDiscount;
    }

    return {
        subtotal,
        groupDiscount,
        groupDiscountPercentage,
        codeDiscount,
        total: Math.max(0, Math.round(total * 100) / 100),
        itemCount
    };
}
