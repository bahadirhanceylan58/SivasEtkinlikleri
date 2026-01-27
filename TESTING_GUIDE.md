# Test ve Doğrulama Rehberi - Sivas Etkinlikleri

## 🎯 Test Kapsamı

Bu döküman, gelişmiş bilet sisteminin tüm özelliklerini test etmek için kullanılır.

---

## ✅ Test Senaryoları

### 1. İndirim Kodları Sistemi

#### Test 1.1: Kod Oluşturma (Admin)
**Adımlar:**
1. Admin paneline giriş yap
2. "İndirim Kodları" sekmesine git
3. "Yeni Kod" butonuna tıkla
4. Formu doldur:
   - Kod: `TEST20`
   - Tür: Yüzde
   - Değer: 20
   - Geçerlilik: Bugünden 1 ay sonraya kadar
   - Maksimum kullanım: 100
5. "Kodu Oluştur" butonuna tıkla

**Beklenen Sonuç:**
- ✅ Kod başarıyla oluşturulmalı
- ✅ Listede görünmeli
- ✅ Aktif durumda olmalı

---

#### Test 1.2: Kod Kullanımı (Kullanıcı)
**Adımlar:**
1. Bir etkinliğin ödeme sayfasına git
2. İndirim kodu alanına `TEST20` yaz
3. "Uygula" butonuna tıkla

**Beklenen Sonuç:**
- ✅ "İndirim uygulandı" mesajı
- ✅ Fiyatta %20 azalma
- ✅ Yeşil renkte indirim satırı

---

#### Test 1.3: Geçersiz Kod
**Adımlar:**
1. Ödeme sayfasında `YANLISCODE` gir
2. "Uygula" tıkla

**Beklenen Sonuç:**
- ❌ "Geçersiz indirim kodu" hatası
- ❌ Fiyat değişmemeli

---

#### Test 1.4: Kullanım Limiti
**Adımlar:**
1. Maksimum kullanım 1 olan bir kod oluştur
2. Kodu kullan ve rezervasyon yap
3. Aynı hesapla tekrar kullanmayı dene

**Beklenen Sonuç:**
- ❌ "Bu kodu zaten kullandınız" hatası

---

### 2. Grup Biletleri Sistemi

#### Test 2.1: Otomatik İndirim
**Adımlar:**
1. Ödeme sayfasına git
2. Bilet adedini 1'den 10'a çıkart
3. Fiyat özetini kontrol et

**Beklenen Sonuç:**
- ✅ 5. bilette %10 grup indirimi uygulanmalı
- ✅ 10. bilette %15 grup indirimi uygulanmalı
- ✅ Mavi renkte "Grup İndirimi" satırı

---

#### Test 2.2: Sonraki Tier Önerisi
**Adımlar:**
1. 8 bilet seç
2. Fiyat özetine bak

**Beklenen Sonuç:**
- ✅ "2 bilet daha al, %15 indirim kazan!" mesajı

---

#### Test 2.3: Grup + Kod Kombinasyonu
**Adımlar:**
1. 12 bilet seç (%15 grup indirimi)
2. `TEST20` kodu gir (%20 indirim)
3. Toplam fiyatı kontrol et

**Beklenen Sonuç:**
- ✅ Önce grup indirimi
- ✅ Sonra kod indirimi
- ✅ Her iki indirim de görünür

---

### 3. Sponsorluk Sistemi

#### Test 3.1: Sponsor Başvurusu
**Adımlar:**
1. `/sponsor/[eventId]` sayfasına git
2. Gold tier seç
3. Formu doldur:
   - Şirket adı
   - Logo yükle
   - Website
4. "Başvuruyu Gönder" tıkla

**Beklenen Sonuç:**
- ✅ Başarı mesajı
- ✅ Etkinlik sayfasına yönlendir
- ✅ Firestore'da `sponsors` koleksiyonunda kayıt

---

#### Test 3.2: Admin Onayı
**Adımlar:**
1. Admin panelinde Sponsors tab'ına git
2. Pending başvuruları gör
3. Bir başvuruyu onayla

**Beklenen Sonuç:**
- ✅ Status `approved` olmalı
- ✅ Etkinlik sayfasında logo görünmeli (gelecek özellik)

---

### 4. Koltuk Seçimi Sistemi

#### Test 4.1: Koltuk Seçimi
**Adımlar:**
1. `hasSeatSelection: true` olan bir etkinliğin ödeme sayfasına git
2. Koltuk haritasında A1, A2, B5 koltukları seç
3. Fiyat özetini kontrol et

**Beklenen Sonuç:**
- ✅ Seçili koltuklar mavi olmalı
- ✅ "Seçili Koltuklar: A1, A2, B5" mesajı
- ✅ VIP koltuk seçilirse fiyat artmalı

---

#### Test 4.2: Satılmış Koltuk
**Adımlar:**
1. Kırmızı (satılmış) bir koltuğa tıkla

**Beklenen Sonuç:**
- ❌ Koltuk seçilmemeli
- ❌ Cursor `not-allowed` olmalı

---

#### Test 4.3: Maksimum Koltuk Limiti
**Adımlar:**
1. 10 koltuk seç
2. 11. koltuğu seçmeye çalış

**Beklenen Sonuç:**
- ❌ "En fazla 10 koltuk seçebilirsiniz" alert

---

### 5. Ödeme Sayfası

#### Test 5.1: Form Validasyonu
**Adımlar:**
1. Ödeme sayfasında form alanlarını boş bırak
2. "Rezervasyon Yap" butonuna tıkla

**Beklenen Sonuç:**
- ❌ "Lütfen iletişim bilgilerini giriniz" hatası

---

#### Test 5.2: Başarılı Rezervasyon
**Adımlar:**
1. Tüm alanları doldur
2. İndirim kodu kullan (opsiyonel)
3. "Rezervasyon Yap" tıkla

**Beklenen Sonuç:**
- ✅ Loading state
- ✅ Başarı mesajı
- ✅ `/biletlerim` sayfasına yönlendir
- ✅ QR kod oluşturulmalı

---

### 6. Responsive Tasarım

#### Test 6.1: Mobil (≤768px)
**Adımlar:**
1. Chrome DevTools ile mobil görünüme geç
2. Tüm sayfaları kontrol et

**Beklenen Sonuç:**
- ✅ Stack edilmiş layout
- ✅ Touch-friendly butonlar
- ✅ Kaydırma sorunsuz

---

#### Test 6.2: Tablet (768px-1024px)
**Adımlar:**
1. Tablet boyutuna ayarla
2. Ödeme sayfasını kontrol et

**Beklenen Sonuç:**
- ✅ 2 kolon layout korunmalı
- ✅ Koltuk haritası scale etmeli

---

## 📊 Test Checklist

### Fonksiyonel Testler
- [ ] İndirim kodu oluşturma
- [ ] İndirim kodu kullanma
- [ ] Geçersiz kod kontrolü
- [ ] Grup indirimi hesaplama
- [ ] Sponsor başvurusu
- [ ] Koltuk seçimi
- [ ] Rezervasyon oluşturma
- [ ] QR kod oluşturma

### UI/UX Testler
- [ ] Tüm butonlar çalışıyor
- [ ] Form validasyonu aktif
- [ ] Loading states gösteriliyor
- [ ] Hata mesajları net
- [ ] Başarı mesajları gösteriliyor
- [ ] Animasyonlar smooth

### Responsive Testler
- [ ] Mobil (iPhone 12)
- [ ] Tablet (iPad)
- [ ] Desktop (1920x1080)
- [ ] Landscape/Portrait

### Performance Testler
- [ ] Sayfa yüklenme < 3 saniye
- [ ] Build başarılı
- [ ] Console'da hata yok
- [ ] Network istekleri optimize

---

## 🐛 Bilinen Sorunlar

1. **Google Fonts**: Build'de font yükleme hatası (internet bağlantısı)
   - **Çözüm**: Lokal font kullan veya fallback ekle

2. **Real-time Updates**: Koltuk seçimi real-time değil
   - **Gelecek**: Firestore listeners ekle

3. **Email Notifications**: Henüz yok
   - **Gelecek**: SendGrid entegrasyonu

---

## 📝 Test Raporu Şablonu

```markdown
### Test Tarihi: [TARİH]
### Test Eden: [İSİM]

#### Başarılı Testler:
- ✅ İndirim kodu sistemi
- ✅ Grup indirimleri
- ...

#### Başarısız Testler:
- ❌ [Test adı]
  - Hata: [Açıklama]
  - Adımlar: [Nasıl tekrarlanır]

#### Öneriler:
- [İyileştirme önerisi 1]
- [İyileştirme önerisi 2]
```

---

## 🚀 Production Checklist

Canlıya almadan önce:
- [ ] Tüm testler başarılı
- [ ] Build başarılı (0 hata, 0 warning)
- [ ] Firebase güvenlik kuralları aktif
- [ ] Environment variables ayarlı
- [ ] Analytics entegre
- [ ] SEO optimize edildi
- [ ] Sosyal medya paylaşım kartları
- [ ] HTTPS aktif
- [ ] Backup sistemi hazır

**Test Son Güncelleme:** 27 Ocak 2026
