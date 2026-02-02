# Kurslar - Firestore Veritabanı Şeması

Bu doküman, SivasEtkinlikleri uygulamasının kurslar özelliği için kullanılan Firestore koleksiyonlarını tanımlar.

## 📊 Koleksiyonlar

```
firestore/
├── courses/                   # Kurslar
├── course_enrollments/        # Kurs kayıtları
└── course_reviews/            # Kurs değerlendirmeleri
```

---

## 1️⃣ courses (Kurslar)

### Yapı
```typescript
{
  id: string,                    // Auto-generated
  title: string,
  description: string,
  shortDescription: string,      // Kısa açıklama (kart için)
  category: string,              // 'Yazılım', 'Dil', 'Sanat', 'Spor', 'Müzik', vb.
  subCategory: string,
  imageUrl: string,
  
  // Eğitmen Bilgileri
  instructorId: string,          // Kurs oluşturan kullanıcı
  instructorName: string,
  instructorBio?: string,
  instructorImage?: string,
  
  // Kurs Detayları
  difficulty: 'Başlangıç' | 'Orta' | 'İleri',
  duration: number,              // Toplam süre (saat)
  language: string,              // 'Türkçe', 'İngilizce'
  
  // Tarih ve Süre
  startDate: Timestamp,
  endDate: Timestamp,
  schedule: {                    // Ders programı
    day: string,                 // 'Pazartesi', 'Çarşamba'
    time: string                 // '19:00-21:00'
  }[],
  
  // Kayıt
  maxStudents: number,
  enrolledCount: number,
  price: number,                 // 0 = ücretsiz
  
  // İçerik
  curriculum: {                  // Müfredat
    week: number,
    title: string,
    topics: string[]
  }[],
  
  requirements?: string[],       // Ön koşullar
  whatYouWillLearn: string[],    // Öğrenilecekler
  
  // Lokasyon
  locationType: 'online' | 'physical' | 'hybrid',
  location?: string,             // Fiziksel lokasyon
  meetingLink?: string,          // Online link (yalnızca kayıtlı öğrenciler görebilir)
  
  // Durum
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled',
  
  // Değerlendirme
  rating?: number,               // 1-5
  reviewCount?: number,
  
  createdAt: Timestamp,
  updatedAt: Timestamp,
  approvedAt?: Timestamp,
  approvedBy?: string            // Admin user ID
}
```

### İndeksler
- `category` (ascending)
- `status` (ascending)
- `instructorId` (ascending)
- `startDate` (ascending)
- Compound: `status` + `startDate` (ascending)

---

## 2️⃣ course_enrollments (Kurs Kayıtları)

### Yapı
```typescript
{
  id: string,
  courseId: string,
  userId: string,
  
  // Kayıt Bilgileri
  enrolledAt: Timestamp,
  status: 'active' | 'completed' | 'dropped',
  
  // Ödeme (ücretli kurslar için)
  paymentStatus?: 'pending' | 'paid',
  amount?: number,
  paymentType?: 'online' | 'pay_at_start',
  
  // İlerleme
  progress: number,              // 0-100%
  completedLessons?: number[],   // [1, 2, 3] hafta numaraları
  completedAt?: Timestamp
}
```

### İndeksler
- `userId` (ascending)
- `courseId` (ascending)
- `status` (ascending)
- Compound: `userId` + `enrolledAt` (descending)
- Compound: `courseId` + `status`

---

## 3️⃣ course_reviews (Kurs Değerlendirmeleri)

### Yapı
```typescript
{
  id: string,
  courseId: string,
  userId: string,
  userName: string,
  userPhoto?: string,
  
  rating: number,                // 1-5
  comment: string,
  
  createdAt: Timestamp,
  helpful: number,               // Faydalı bulan sayısı
}
```

### İndeksler
- `courseId` (ascending)
- `userId` (ascending)
- Compound: `courseId` + `createdAt` (descending)

---

## 🔒 Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Courses - Herkes okuyabilir, kayıtlı kullanıcılar oluşturabilir
    match /courses/{courseId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.instructorId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Course Enrollments - Kendi kayıtlarını görebilir
    match /course_enrollments/{enrollmentId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.uid == get(/databases/$(database)/documents/courses/$(resource.data.courseId)).data.instructorId);
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Course Reviews - Herkes okuyabilir, kayıtlı olan değerlendirebilir
    match /course_reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 📝 Önemli Notlar

1. **Admin Onayı**: Tüm kurslar `status: 'pending'` ile başlar ve admin onayı gerektirir
2. **Kurs Durumları**:
   - `pending`: Admin onayı bekliyor
   - `approved`: Onaylandı, görünür
   - `rejected`: Reddedildi
   - `active`: Şu anda devam eden
   - `completed`: Tamamlanmış
   - `cancelled`: İptal edilmiş
3. **Ücretli Kurslar**: Veri yapısı destekler ancak opsiyonel
4. **Cascade Delete**: Kurs silindiğinde ilgili enrollments ve reviews da silinmeli

**Oluşturulma Tarihi:** 2 Şubat 2026
