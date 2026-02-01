// Gelişmiş Bilet Sistemi Tipleri

// ===== İndirim Kodları =====
export interface DiscountCode {
    id: string;
    code: string; // "YENIYIL2026"
    type: 'percentage' | 'fixed'; // %20 veya 50₺
    value: number;

    // Kullanım Kuralları
    maxUsage: number; // Toplam kullanım limiti (0 = sınırsız)
    usedCount: number;
    maxUsagePerUser: number; // Kullanıcı başına (0 = sınırsız)

    // Geçerlilik
    validFrom: Date | string;
    validUntil: Date | string;
    isActive: boolean;

    // Kısıtlamalar (opsiyonel)
    minPurchaseAmount?: number; // Minimum tutar
    applicableEvents?: string[]; // Sadece belirli etkinlikler
    applicableCategories?: string[];

    // Meta
    createdAt: Date | string;
    createdBy: string;
    description?: string;
}

export interface UserCodeUsage {
    codeId: string;
    code: string;
    usedAt: Date | string;
    eventId: string;
    userId: string;
    discountAmount: number;
}

export interface DiscountValidationResult {
    valid: boolean;
    error?: string;
    discountAmount?: number;
    finalPrice?: number;
}

// ===== Grup Biletleri =====
export interface GroupTicketTier {
    id: string;
    minTickets: number; // 5, 10, 20
    discount: number; // 0.10 = %10 indirim
    name: string; // "Aile Paketi", "Arkadaş Grubu"
    description?: string;
}

// ===== Koltuk Seçimi =====
export interface SeatingMap {
    layout: 'theater' | 'concert' | 'conference' | 'stadium';
    sections: Section[];
    totalSeats: number;
}

export interface Section {
    id: string;
    name: string; // "Balkon", "Ön Sıra", "VIP"
    rows: Row[];
    priceMultiplier: number; // 1.0 = normal, 1.5 = %50 daha pahalı
    color?: string;
}

export interface Row {
    rowNumber: string; // "A", "B", "C"
    seats: Seat[];
}

export interface Seat {
    seatNumber: number;
    status: 'available' | 'reserved' | 'selected' | 'blocked';
    reservedBy?: string; // userId
    reservationExpiry?: Date | string; // 10 dakika
}

// ===== Sponsorluk/Bağış =====
export interface SponsorshipTier {
    id: string;
    name: string; // "Bronz", "Gümüş", "Altın", "Platin"
    amount: number;
    benefits: string[]; // ["Logo etkinlik sayfasında", "VIP koltuk"]
    color: string; // Görsel tema
    icon?: string;
}

export interface Sponsor {
    id?: string;
    userId: string;
    eventId: string;
    tier: string;
    amount: number;
    companyName?: string;
    logoUrl?: string;
    website?: string;
    message?: string;
    displayOnSite: boolean;
    status: 'pending' | 'approved' | 'rejected';
    contactEmail?: string;
    createdAt: Date | string;
}

// ===== Sepet =====
export interface CartItem {
    type: 'ticket' | 'donation' | 'sponsorship';
    quantity?: number;
    seats?: string[]; // Koltuk seçimi varsa ["A1", "A2"]
    sectionId?: string;
    basePrice: number;
    discounts: {
        group?: number;
        code?: number;
    };
    finalPrice: number;
}

export interface Cart {
    items: CartItem[];
    subtotal: number;
    totalDiscount: number;
    total: number;
    appliedCode?: string;
}

// ===== Event Güncellemeleri =====
export interface TicketType {
    name: string;
    price: number;
    available?: number; // Stok kontrolü için
    description?: string;
}

export interface EnhancedEvent {
    // Mevcut Event alanları + yeni alanlar
    seatingEnabled?: boolean;
    seatingMap?: SeatingMap;
    groupTickets?: GroupTicketTier[];
    sponsorshipEnabled?: boolean;
    sponsorshipTiers?: SponsorshipTier[];
    acceptDonations?: boolean;
    suggestedDonations?: number[]; // [50, 100, 250, 500]
    ticketTypes?: TicketType[];
}
