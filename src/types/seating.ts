// Seating System Types

export interface SeatCategory {
    id: string;
    name: string;
    color: string;
    price: number;
    rows: number[];
}

export interface BlockedSeat {
    row: number;
    seat: number;
}

export interface SeatingConfig {
    venueType: 'theater' | 'concert_hall' | 'stadium' | 'conference' | 'custom';
    rows: number;
    seatsPerRow: number;
    categories: SeatCategory[];
    blockedSeats: BlockedSeat[];
}

export interface Seat {
    id: string;
    row: number;
    seat: number;
    status: 'available' | 'reserved' | 'sold' | 'blocked';
    category: string;
    price: number;
    reservedBy?: string;
    reservedAt?: number;
    soldTo?: string;
    soldAt?: number;
}

export interface VenueTemplate {
    name: string;
    rows: number;
    seatsPerRow: number;
    categories: Omit<SeatCategory, 'id'>[];
}

export const VENUE_TEMPLATES: Record<string, VenueTemplate> = {
    theater: {
        name: 'Tiyatro',
        rows: 20,
        seatsPerRow: 30,
        categories: [
            { name: 'VIP', color: '#FFD700', price: 500, rows: [1, 2, 3, 4, 5] },
            { name: 'Normal', color: '#4CAF50', price: 300, rows: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
            { name: 'Balkon', color: '#2196F3', price: 200, rows: [16, 17, 18, 19, 20] }
        ]
    },
    concert_hall: {
        name: 'Konser Salonu',
        rows: 30,
        seatsPerRow: 50,
        categories: [
            { name: 'Sahne Önü', color: '#FF6B6B', price: 800, rows: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
            { name: 'Orta', color: '#4ECDC4', price: 500, rows: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
            { name: 'Arka', color: '#95E1D3', price: 300, rows: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30] }
        ]
    },
    stadium: {
        name: 'Stadyum',
        rows: 40,
        seatsPerRow: 80,
        categories: [
            { name: 'Tribune A', color: '#E74C3C', price: 1000, rows: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
            { name: 'Tribune B', color: '#3498DB', price: 700, rows: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
            { name: 'Tribune C', color: '#2ECC71', price: 500, rows: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30] },
            { name: 'Tribune D', color: '#F39C12', price: 300, rows: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40] }
        ]
    },
    conference: {
        name: 'Konferans Salonu',
        rows: 15,
        seatsPerRow: 25,
        categories: [
            { name: 'Ön Sıra', color: '#9B59B6', price: 400, rows: [1, 2, 3, 4, 5] },
            { name: 'Orta Sıra', color: '#3498DB', price: 250, rows: [6, 7, 8, 9, 10] },
            { name: 'Arka Sıra', color: '#1ABC9C', price: 150, rows: [11, 12, 13, 14, 15] }
        ]
    }
};
