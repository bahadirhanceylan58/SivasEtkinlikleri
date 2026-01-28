# Mobil Kurulum ve APK Rehberi 📱

Bu proje bir **PWA (Progressive Web App)** olarak geliştirilmiştir. Bu sayede hem web sitesi olarak çalışır hem de telefonlara uygulama gibi yüklenebilir.

## 1. PWA Olarak Yükleme (Önerilen) ✅
APK dosyasına ihtiyaç duymadan, uygulamanın sunduğu en modern yöntemdir. Güncellemeleri otomatik alır.

### Android İçin:
1.  Chrome'da siteye girin.
2.  Alt tarafta çıkan **"Ana Ekrana Ekle"** veya **"Uygulamayı Yükle"** butonuna basın.
3.  Eğer çıkmazsa: Seçenekler (3 nokta) > **"Uygulamayı Yükle"** seçeneğine tıklayın.
4.  Uygulama menünüze "Sivas Etkinlikleri" ikonu gelecektir.

### iOS (iPhone) İçin:
1.  Safari'de siteye girin.
2.  Alt menüdeki **Paylaş** butonuna basın.
3.  **"Ana Ekrana Ekle"** seçeneğini seçin.

---

## 2. APK Dosyası Oluşturma (İleri Düzey) 🛠️
Eğer uygulamanızı Google Play Store'a yüklemek veya arkadaşınıza `.apk` dosyası olarak göndermek istiyorsanız:

Bu proje PWA olduğu için **PWABuilder** aracını kullanarak onu gerçek bir mobil uygulamaya dönüştürebilirsiniz.

### Adımlar:
1.  Önce projenizi yayına alın (Vercel, Netlify vb.).
    *   *Örn: https://sivas-etkinlikleri.vercel.app*
2.  **[PWABuilder.com](https://www.pwabuilder.com/)** adresine gidin.
3.  Sitenizin URL'ini yapıştırın ve **Start** deyin.
4.  Sistem PWA uyumluluğunu kontrol edecek (Şu an %100 uyumlu yaptık).
5.  **"Package for Stores"** butonuna tıklayın.
6.  **Android** seçeneğini seçin ve **Generate** diyerek APK/AAB dosyanızı indirin.

Böylece elinizde imzalı bir APK dosyası olacaktır.

---
*Not: En iyi performans ve güncelleme kolaylığı için 1. yöntemi (PWA Kurulumu) öneririz.*
