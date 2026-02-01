import { Seat } from '@/types/seating';

/**
 * Basit bir salon düzeni oluşturur (Demo için)
 */
export function generateSimpleVenue(rows: number = 8, seatsPerRow: number = 12): Seat[] {
    const seats: Seat[] = [];
    const rowLetters = 'ABCDEFGHIJ'.split('');

    for (let r = 0; r < rows; r++) {
        const rowLetter = rowLetters[r];
        const isVipRow = r < 2; // İlk 2 sıra VIP

        for (let s = 1; s <= seatsPerRow; s++) {
            seats.push({
                row: rowLetter,
                number: s,
                section: isVipRow ? 'vip' : 'normal',
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
export function parseSeatId(seatId: string): { row: string; number: number } | null {
    const match = seatId.match(/^([A-Z])(\d+)$/);
    if (!match) return null;

    return {
        row: match[1],
        number: parseInt(match[2])
    };
}

/**
 * Seçili koltukların toplam fiyatını hesaplar
 */
export function calculateSeatsTotal(seats: Seat[], selectedSeatIds: string[]): number {
    return selectedSeatIds.reduce((total, seatId) => {
        const parsed = parseSeatId(seatId);
        if (!parsed) return total;

        const seat = seats.find(s => s.row === parsed.row && s.number === parsed.number);
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
        const seatId = `${seat.row}${seat.number}`;
        if (soldSeatIds.includes(seatId)) {
            return { ...seat, status: 'sold' as const };
        }
        return seat;
    });
}
