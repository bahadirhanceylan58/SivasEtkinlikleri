import { Seat } from '@/types/seating';

/**
 * Basit bir salon düzeni oluşturur (Demo için)
 */
export function generateSimpleVenue(rows: number = 8, seatsPerRow: number = 12): Seat[] {
    const seats: Seat[] = [];

    for (let r = 1; r <= rows; r++) {
        const isVipRow = r <= 2; // İlk 2 sıra VIP

        for (let s = 1; s <= seatsPerRow; s++) {
            seats.push({
                id: `R${r}S${s}`,
                row: r,
                seat: s,
                category: isVipRow ? 'vip' : 'normal',
                status: 'available',
                price: isVipRow ? 250 : 150
            });
        }
    }

    return seats;
}

/**
 * Koltuk ID'sini parse eder
 */
export function parseSeatId(seatId: string): { row: number; seat: number } | null {
    const match = seatId.match(/^R(\d+)S(\d+)$/);
    if (!match) return null;

    return {
        row: parseInt(match[1]),
        seat: parseInt(match[2])
    };
}

/**
 * Seçili koltukların toplam fiyatını hesaplar
 */
export function calculateSeatsTotal(seats: Seat[], selectedSeatIds: string[]): number {
    return selectedSeatIds.reduce((total, seatId) => {
        const parsed = parseSeatId(seatId);
        if (!parsed) return total;

        const seat = seats.find(s => s.row === parsed.row && s.seat === parsed.seat);
        return total + (seat?.price || 0);
    }, 0);
}

/**
 * Seçili koltukları formatlı string olarak döner
 */
export function formatSelectedSeats(seatIds: string[]): string {
    if (seatIds.length === 0) return '';
    if (seatIds.length === 1) return seatIds[0];

    return seatIds.sort().join(', ');
}

/**
 * Satılmış koltukları işaretle (örnek veri için)
 */
export function markSoldSeats(seats: Seat[], soldSeatIds: string[]): Seat[] {
    return seats.map(seat => {
        const seatId = seat.id;
        if (soldSeatIds.includes(seatId)) {
            return { ...seat, status: 'sold' as const };
        }
        return seat;
    });
}
