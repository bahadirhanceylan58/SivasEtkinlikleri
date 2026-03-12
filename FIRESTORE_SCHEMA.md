# Firestore Veritabanı Şeması - Sivas Etkinlikleri

## 📊 Koleksiyonlar Özeti

```
firestore/
├── events/                    # Etkinlikler
├── tickets/                   # Bilet rezervasyonları
├── discountCodes/             # İndirim kodları
├── discountCodeUsage/         # Kod kullanım kayıtları
├── sponsors/                  # Sponsor başvuruları
├── clubs/                     # Kulüpler
├── club_applications/         # Kulüp başvuruları
└── users/                     # Kullanıcı profilleri
```

---

## 1️⃣ events (Etkinlikler)

### Yapı
```typescript
{
  id: string,                    // Auto-generated
  title: string,
  description: string,
  date: Timestamp,
  time: string,
  location: string,
  category: string,              // 'Konser', 'Tiyatro', 'Spor', vb.
  subCategory: string,
  imageUrl: string,
  organizerId: string,           // Oluşturan kullanıcı ID
  participantIds: string[],      // Katılan kullanıcılar
  maxParticipants: number,
  price: number,                 // Temel bilet fiyatı
  
  // Gelişmiş Özellikler
  hasSeatSelection: boolean,     // Koltuk seçimi var mı?
  seatingMap?: {                 // Koltuk haritası (varsa)
    rows: number,
    seatsPerRow: number,
    soldSeats: string[]          // ['A1', 'A2', 'B5']
  },
  groupTickets?: {               // Grup indirimleri
    id: string,
    name: string,
    minTickets: number,
    discount: number             // 0.10 = %10
  }[],
  ticketTypes?: { name: string; price: number }[],
  vatRate: number,               // %10 veya %20 (Default: 10)
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### İndeksler
- `category` (ascending)
- `date` (ascending)
- `organizerId` (ascending)

---

## 2️⃣ tickets (Bilet Rezervasyonları)

### Yapı
```typescript
{
  id: string,
  userId: string,                // Bilet sahibi
  eventId: string,
  eventTitle: string,
  eventDate: string,
  eventLocation: string,
  eventImage: string,
  
  // Bilet Detayları
  ticketCount: number,
  basePrice: number,
  subtotal: number,
  
  // İndirimler
  groupDiscount?: number,
  groupDiscountPercentage?: number,
  discountAmount?: number,
  discountCode?: string,
  
  // Koltuk Seçimi
  selectedSeats?: string[],      // ['A1', 'A2']
  
  // Vergi Detayları (KDV)
  vatRate: number,               // Uygulanan KDV oranı
  taxBase: number,               // Matrah (KDV'siz tutar)
  vatAmount: number,             // KDV Tutarı
  
  totalAmount: number,
  
  // İletişim
  contactName: string,
  contactPhone: string,
  
  // Durum
  status: 'reserved' | 'confirmed' | 'cancelled',
  paymentType: 'pay_at_door' | 'online',
  qrCode: string,
  purchaseDate: Timestamp,
  
  createdAt: Timestamp
}
```

### İndeksler
- `userId` (ascending)
- `eventId` (ascending)
- `status` (ascending)
- Compound: `userId` + `createdAt` (descending)

---

## 3️⃣ discountCodes (İndirim Kodları)

### Yapı
```typescript
{
  id: string,
  code: string,                  // 'YENIYIL2026' (uppercase)
  type: 'percentage' | 'fixed',
  value: number,                 // 20 veya 50
  
  // Limitler
  maxUsage: number,              // 0 = unlimited
  usedCount: number,
  maxUsagePerUser: number,       // 1 = tek kullanım
  
  // Geçerlilik
  validFrom: Timestamp,
  validUntil: Timestamp,
  isActive: boolean,
  
  // Kısıtlamalar
  minPurchaseAmount?: number,
  applicableEvents?: string[],   // Belirli etkinlikler
  applicableCategories?: string[],
  
  description?: string,
  createdBy: string,             // Admin user ID
  createdAt: Timestamp
}
```

### İndeksler
- `code` (ascending) - UNIQUE
- `isActive` (ascending)
- Compound: `isActive` + `validUntil` (ascending)

---

## 4️⃣ discountCodeUsage (Kod Kullanım Kayıtları)

### Yapı
```typescript
{
  id: string,
  codeId: string,
  code: string,
  userId: string,
  eventId: string,
  discountAmount: number,
  usedAt: Timestamp
}
```

### İndeksler
- `codeId` (ascending)
- `userId` (ascending)
- Compound: `codeId` + `userId`

---

## 5️⃣ sponsors (Sponsorlar)

### Yapı
```typescript
{
  id: string,
  eventId: string,
  userId: string,                // Başvuran kullanıcı
  
  // Tier
  tier: 'bronze' | 'silver' | 'gold' | 'platinum',
  amount: number,                // 500, 1000, 2500, 5000
  
  // Şirket Bilgileri
  companyName: string,
  logoUrl: string,               // Firebase Storage URL
  website?: string,
  contactEmail: string,
  message?: string,
  
  // Görünürlük
  displayOnSite: boolean,
  status: 'pending' | 'approved' | 'rejected',
  
  createdAt: Timestamp,
  approvedAt?: Timestamp,
  approvedBy?: string            // Admin user ID
}
```

### İndeksler
- `eventId` (ascending)
- `status` (ascending)
- Compound: `eventId` + `status` + `tier`

---

## 6️⃣ clubs (Kulüpler)

### Yapı
```typescript
{
  id: string,
  name: string,
  description: string,
  category: string,
  imageUrl: string,
  email: string,
  adminId: string,               // Kulüp yöneticisi
  memberCount: number,
  createdAt: Timestamp
}
```

---

## 7️⃣ club_applications (Kulüp Başvuruları)

### Yapı
```typescript
{
  id: string,
  name: string,
  description: string,
  category: string,
  imageUrl: string,
  email: string,
  userId: string,
  status: 'pending' | 'approved' | 'rejected',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 8️⃣ users (Kullanıcı Profilleri)

### Yapı
```typescript
{
  id: string,                    // Firebase Auth UID
  email: string,
  displayName: string,
  photoURL?: string,
  role: 'user' | 'admin',
  createdAt: Timestamp,
  
  // İstatistikler
  totalTickets?: number,
  totalSponsorship?: number
}
```

---

## 🔒 Security Rules (Önerilen)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Events - Herkes okuyabilir, sadece admin/organizatör yazabilir
    match /events/{eventId} {
      allow read: if true;
      allow create, update:  if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' || 
         request.auth.uid == resource.data.organizerId);
    }
    
    // Tickets - Sadece kendi biletlerini görebilir
    match /tickets/{ticketId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    // Discount Codes - Herkes okuyabilir, sadece admin yazabilir
    match /discountCodes/{codeId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Sponsors - Başvuran okuyabilir, admin onaylayabilir
    match /sponsors/{sponsorId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 📝 Notlar

1. **Timestamp vs String**: Tarihler Firestore Timestamp olarak saklanıyor
2. **Image URLs**: Firebase Storage kullanılıyor (`gs://` veya HTTPS URL)
3. **Cascade Delete**: Event silindiğinde ilgili tickets/sponsors da silinmeli (Cloud Function)
4. **Indexing**: Sık sorgulanan alanlar için composite index gerekli
5. **Backup**: Düzenli Firestore export önerilir

**Son Güncelleme:** 27 Ocak 2026
