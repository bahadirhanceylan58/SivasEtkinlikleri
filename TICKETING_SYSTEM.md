# Gelişmiş Bilet Sistemi - Geliştirici Dökümanı

## 🎯 Proje Özeti

Sivas Etkinlikleri platformu için gelişmiş bilet sistemi. 4 major özellik içerir:
1. **İndirim Kodları** - Yüzde/sabit tutar indirimleri
2. **Grup Biletleri** - Otomatik tier-based indirimler
3. **Sponsorluk** - 4-tier kurumsal destek sistemi
4. **Koltuk Seçimi** - İnteraktif koltuk haritası

## 📁 Dosya Yapısı

```
src/
├── types/
│   └── ticketing.ts              # Tüm tip tanımları
├── lib/
│   ├── discountValidator.ts     # İndirim kodu validasyonu
│   ├── groupTickets.ts          # Grup bilet hesaplamaları
│   ├── sponsorship.ts           # Sponsorluk utilities
│   └── seatManagement.ts        # Koltuk yönetimi
├── components/
│   ├── DiscountCodeInput.tsx    # İndirim kodu input
│   ├── SponsorTierCard.tsx      # Tier seçim kartı
│   └── SeatMap.tsx              # Koltuk haritası
└── app/
    ├── odeme/[id]/page.tsx      # Ödeme sayfası (indirim + grup)
    ├── sponsor/[eventId]/page.tsx # Sponsor başvuru
    └── admin/page.tsx           # Admin panel (kodlar)
```

## 🚀 Özellikler

### 1. İndirim Kodları

**Kullanım:**
```tsx
import { validateDiscountCode } from '@/lib/discountValidator';

const result = await validateDiscountCode(
  code: "YENIYIL20",
  userId: "user123",
  eventId: "event456",
  eventCategory: "Konser",
  purchaseAmount: 500
);

if (result.valid) {
  console.log("İndirim:", result.discountAmount);
  console.log("Yeni Fiyat:", result.finalPrice);
}
```

**Firestore:**
```javascript
discountCodes/
  - code: "YENIYIL20"
  - type: "percentage" | "fixed"
  - value: 20
  - maxUsage: 100
  - usedCount: 15
  - validFrom: Timestamp
  - validUntil: Timestamp
```

### 2. Grup Biletleri

**Kullanım:**
```tsx
import { calculateGroupDiscount } from '@/lib/groupTickets';

const tiers = [
  { id: '1', minTickets: 5, discount: 0.10 },
  { id: '2', minTickets: 10, discount: 0.15 }
];

const result = calculateGroupDiscount(150, 12, tiers);
// result.discount: 270
// result.finalPrice: 1530
// result.appliedTier: { minTickets: 10, discount: 0.15 }
```

### 3. Sponsorluk

**Tierlar:**
- **Bronze:** 500₺ - Küçük logo
- **Silver:** 1,000₺ - Orta logo + website
- **Gold:** 2,500₺ - Büyük logo + materyal
- **Platinum:** 5,000₺ - En büyük + VIP

**Başvuru Sayfası:** `/sponsor/[eventId]`

**Firestore:**
```javascript
sponsors/
  - eventId: "..."
  - tier: "gold"
  - companyName: "ABC Şirketi"
  - logoUrl: "https://..."
  - status: "pending" | "approved"
```

### 4. Koltuk Seçimi

**Kullanım:**
```tsx
import SeatMap, { Seat } from '@/components/SeatMap';
import { generateSimpleVenue } from '@/lib/seatManagement';

const seats = generateSimpleVenue(8, 12); // 8 satır, 12 koltuk
const [selected, setSelected] = useState<string[]>([]);

<SeatMap
  seats={seats}
  selectedSeats={selected}
  onSeatClick={(id) => {
    // Toggle seat
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  }}
  maxSeats={10}
/>
```

## 🗄️ Firestore Schema

### discountCodes
```
{
  code: string,
  type: 'percentage' | 'fixed',
  value: number,
  maxUsage: number,
  usedCount: number,
  maxUsagePerUser: number,
  validFrom: Timestamp,
  validUntil: Timestamp,
  isActive: boolean,
  minPurchaseAmount?: number,
  applicableEvents?: string[],
  createdAt: Timestamp
}
```

### discountCodeUsage
```
{
  codeId: string,
  userId: string,
  eventId: string,
  discountAmount: number,
  usedAt: Timestamp
}
```

### sponsors
```
{
  eventId: string,
  userId: string,
  tier: 'bronze' | 'silver' | 'gold' | 'platinum',
  amount: number,
  companyName: string,
  logoUrl: string,
  website?: string,
  message?: string,
  status: 'pending' | 'approved' | 'rejected',
  createdAt: Timestamp
}
```

## 📋 TODO / İyileştirmeler

### Kısa Vadeli:
- [ ] Ödeme sayfasına koltuk seçimi entegrasyonu
- [ ] Etkinlik sayfasında sponsor bölümü
- [ ] Admin panelinde sponsor yönetimi tab'ı
- [ ] Biletlerim sayfasında koltuk bilgisi gösterimi

### Orta Vadeli:
- [ ] Real-time koltuk güncelleme (Firestore listeners)
- [ ] Email bildirimler (sponsor onayı vb.)
- [ ] İstatistik dashboard (admin)
- [ ] Bağış widget'ı

### Uzun Vadeli:
- [ ] Ödeme entegrasyonu (Stripe/Iyzico)
- [ ] Gelişmiş salon düzenleri
- [ ] QR kod tarama app
- [ ] Bilet yazdırma sistemi

## 🧪 Test Senaryoları

### İndirim Kodu:
1. Admin'den "TEST20" kodu oluştur (%20)
2. Ödeme sayfasında kodu gir
3. Fiyatın %20 azaldığını doğrula

### Grup İndirimi:
1. 10 bilet seç
2. Otomatik %15 indirim uygulandığını gör
3. 2 bilet daha ekle → "8 bilet daha al %20 kazan" mesajını gör

### Sponsorluk:
1. `/sponsor/[eventId]` sayfasına git
2. Gold tier seç
3. Logo yükle
4. Başvuru gönder
5. Admin panelinden onayla

### Koltuk Seçimi:
1. SeatMap komponentini render et
2. A1, A2, B5 koltukları seç
3. Fiyatın doğru hesaplandığını kontrol et
4. VIP koltuk seçince fiyatın arttığını gör

## 🚀 Deployment

```bash
# Build
npm run build

# Production
npm start
```

## 📞 Destek

Sorular için: bahadirhanceylan58@gmail.com

---

**Version:** 1.0.0  
**Son Güncelleme:** 27 Ocak 2026  
**Durum:** Production Ready ✅
