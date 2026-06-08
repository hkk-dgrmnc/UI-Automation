# YTKP-1009 Test Case Dokümanı

Bu doküman, `Yeni MFYS > Otomatik Parametre Tanımlama` ekranı için manuel/otomasyon test senaryolarını VS Code içinde Codex'in kolay anlayabileceği text formatında içerir.

## Genel Akış

- Ekran: Yeni MFYS > Otomatik Parametre Tanımlama
- Ana bölümler:
  - Otomatik Parametre Bilgileri
  - Parametre Listesi
- Kontrol edilecek temel alanlar:
  - İşlem Kodu
  - Tür
  - Tür 2
  - KDV Oranı
  - Fiş Açıklama
  - 1-12. Hesap alanları
  - Kaydet / Güncelle / Sil / Yazdır / Excel'e Aktar butonları
  - Listeleme, filtreleme ve sayfalama alanları

---

## Test Cases

### TC-001 - v1 - Otomatik Parametre Tanımlama ekranı açılış kontrolü

**Action:**
Sol bardan MFYS > Genel Parametre Ayarları > Tanımlama İşlemleri > Otomatik Parametre Tanımlama ekranına gidilir.

**Data:**
Yok

**Expected Result:**
Sol barda `Otomatik Parametre Tanımlama`'nın seçildiği doğrulanır
Ekranın açıldığı doğrulanır.
Üstte `Otomatik Parametre Listesi` başlığı, altta oluşturulan Otomatik Parametre Listesleri bölümü yer almalıdır.

---

## Test Cases

### TC-001 - v2 - Otomatik Parametre Tanımlama ekranı açılış kontrolü

**Action:**
Oluştur butonuna tıklanır

**Data:**
Yok

**Expected Result:**
Üstte `Otomatik Parametre Bilgileri` başlığı bölümü yer almalıdır.

---

### TC-002 - Başlık ve zorunlu alan uyarıları kontrolü

**Action:**
Ekrandaki tüm başlıklar ve uyarı mesajları kontrol edilir.

**Data:**
Yok

**Expected Result:**
Alan başlıkları Türkçe ve anlamlı olmalıdır. 
Örnek alanlar: `İşlem Kodu`, `Tür`, `KDV Oranı`, `Hesaplar`. Zorunlu alanlar boş geçildiğinde `Bu alan zorunludur` benzeri uyarılar verilmelidir.

---

### TC-003 - İşlem Kodu dropdown liste kontrolü

**Action:**
İşlem Kodu dropdown'ı açılır.

**Data:**
Yok

**Expected Result:**
Dropdown listesi `Kod + Açıklama` formatında olmalıdır. Örnek değerler:

- `[001]KAPAMA`
- `[002]VERGİSEL ŞB. KAPAMA`
- `[003]DÖKÜM`

---

### TC-004 - İşlem Kodu [001] KAPAMA seçimi sonrası alan durumu

**Action:**
İşlem Kodu olarak `[001]KAPAMA` seçilir.

**Data:**
`[001]KAPAMA`

**Expected Result:**
`Tür 2` dropdown aktif olmalıdır. `KDV Oranı` alanı pasif/devre dışı olmalıdır.

---

### TC-005 - İşlem Kodu [002] VERGİSEL ŞB. KAPAMA seçimi sonrası alan durumu

**Action:**
İşlem Kodu olarak `[002]VERGİSEL ŞB. KAPAMA` seçilir.

**Data:**
`[002]VERGİSEL ŞB. KAPAMA`

**Expected Result:**
Hem `Tür 2` hem de `KDV Oranı` alanları pasif/devre dışı olmalıdır.

---

### TC-006 - İşlem Kodu [003] DÖKÜM seçimi sonrası alan durumu

**Action:**
İşlem Kodu olarak `[003]DÖKÜM` seçilir.

**Data:**
`[003]DÖKÜM`

**Expected Result:**
`Tür 2` alanı pasif/devre dışı olmalıdır. `KDV Oranı` dropdown aktif olmalıdır.

---

### TC-007 - Fiş Açıklama alanı validasyon kontrolü

**Action:**
Fiş Açıklama alanına veri girilir.

**Data:**
`Yıl Sonu Kapanışı`

**Expected Result:**
Alan maksimum 15 karakter kabul etmelidir. Türkçe karakter desteği olmalıdır. Zorunlu alan olarak çalışmalıdır.

---

### TC-008 - Tür dropdown seçenekleri kontrolü

**Action:**
Tür dropdown'ı açılır.

**Data:**
Yok

**Expected Result:**
Listede aşağıdaki seçenekler görünmelidir:

- `Merkez`
- `Başmüdürlük`
- `Genel Müdürlük`

---

### TC-009 - Tür 2 dropdown seçenekleri kontrolü

**Action:**
Tür 2 dropdown'ı açılır.

**Data:**
Yok

**Expected Result:**
Listede aşağıdaki seçenekler görünmelidir:

- `KDV-1`
- `KDV-2`
- `DAMGA`
- `BSMV`
- `KAMBİYO`
- `KONAKLAMA`

---

### TC-010 - KDV Oranı dropdown seçenekleri kontrolü

**Action:**
KDV Oranı dropdown'ı açılır.

**Data:**
Yok

**Expected Result:**
Listede aşağıdaki değerler görünmelidir:

- `%18`
- `%8`
- `%1`
- `YOK(%0)`
- `%10`
- `%20`

---

### TC-011 - Getir butonları ile Hesap Arama popup kontrolü

**Action:**
Tüm `Getir` butonları, yani 1-12. Hesap alanlarının Getir butonları için kontrol yapılır.

**Data:**
Yok

**Expected Result:**
Her Getir butonuna tıklandığında `Hesap Arama` popup'ı açılmalıdır. Popup listesinde `Hesap No` ve `Hesap Adı` kolonları görünmelidir. Seçim sonrası ilgili hesap alanı otomatik dolmalıdır.

---

### TC-012 - Hesap alanına uzun hesap numarası yapıştırma kontrolü

**Action:**
Herhangi bir hesap alanına uzun hesap numarası Ctrl+V ile yapıştırılır.

**Data:**
`253.01.002.123.456.789`

**Expected Result:**
Sistem yalnızca rakam `0-9` ve nokta `.` kabul etmelidir. Otomatik segment formatı uygulamalıdır. Değer `123.456.789.012.345.678...` benzeri segmentli formatta görünmelidir.

---

### TC-013 - Hesap alanı maksimum uzunluk kontrolü

**Action:**
Herhangi bir hesap alanına 49+ karakter uzunlukta hesap numarası girilir.

**Data:**
`01234567890123456789012345678901234567890123456789`

**Expected Result:**
Sistem `Seviyeler uzunluğu kırılım tanımını aşamaz.` uyarısını vermelidir. Giriş engellenmelidir.

---

### TC-014 - Hesap alanı farklı giriş yöntemleri kontrolü

**Action:**
Hesap alanlarına farklı biçimlerde veri girilir.

**Data:**
- Manuel giriş
- Kopyala-yapıştır
- Otomatik doldurma

**Expected Result:**
Tüm giriş yöntemleri aynı biçimlendirme ve doğrulama kurallarına tabi olmalıdır.

---

### TC-015 - Mükerrer kayıt kontrolü

**Action:**
Aynı İşlem Kodu, Tür ve Tür 2 kombinasyonu ile ikinci kez kayıt eklenmeye çalışılır.

**Data:**
`001 - MR - KDV-1`

**Expected Result:**
Sistem mükerrer kayıt eklenmesini engellemelidir. `Bu kombinasyon zaten mevcut.` uyarısı verilmelidir.

---

### TC-016 - Kaydet butonu ve başarı mesajı kontrolü

**Action:**
`Kaydet` butonuna tıklanır.

**Data:**
Yok

**Expected Result:**
Onay modalı açılmalıdır. Modal mesajı `Kaydetmek istediğinize emin misiniz?` olmalıdır. `Evet` seçilirse kayıt eklenmelidir. `Kayıt başarıyla eklendi.` mesajı görüntülenmelidir.

---

### TC-017 - Listeleme alanı kontrolü

**Action:**
Listeleme alanı kontrol edilir.

**Data:**
Yok

**Expected Result:**
Yeni kayıt doğru satırda görünmelidir. Liste başlıkları aşağıdaki gibi olmalıdır:

- İşlem Kodu
- İşlem Açıklama
- İşlem Tipi
- Sıra No
- Tür
- Tür 2
- KDV Oranı
- 1-12. Hesap

Alt kısımda `Kayıt Sayısı: x / y` görünmelidir.

---

### TC-018 - Listeden kayıt seçimi kontrolü

**Action:**
Listeden bir kayıt seçilir.

**Data:**
Yok

**Expected Result:**
Seçilen satır vurgulanmalıdır. Form alanlarına ilgili kayıt bilgileri yüklenmelidir.

---

### TC-019 - Güncelle butonu ve güncelleme modu kontrolü

**Action:**
`Güncelle` butonuna tıklanır.

**Data:**
Yok

**Expected Result:**
Güncelleme modunda tüm alanlar aktif olmalıdır. Sadece işlem koduna bağlı kurallar nedeniyle pasif olması gereken alanlar pasif kalmalıdır. Örneğin 001/002/003 işlem kodu kuralları korunmalıdır. `Kayıt başarıyla güncellendi.` mesajı görülmelidir.

---

### TC-020 - Sil butonu ve kayıt silme kontrolü

**Action:**
`Sil` butonuna tıklanır.

**Data:**
Yok

**Expected Result:**
Onay modalı açılmalıdır. Modal mesajı `Bu kaydı silmek istediğinize emin misiniz?` olmalıdır. `Evet` seçilirse kayıt silinmeli ve liste yenilenmelidir.

---

### TC-021 - Yazdır butonu ve baskı önizleme kontrolü

**Action:**
`Yazdır` butonuna tıklanır.

**Data:**
Yok

**Expected Result:**
Baskı önizleme ekranı açılmalıdır. Üst bilgilerde aşağıdaki alanlar görünmelidir:

- Kuruluş Adı
- Personel Ad/Soyad
- Birim Adı
- Tarih

Alt kısımda kolon başlıkları hizalı görünmelidir.

---

### TC-022 - Excel'e Aktar butonu kontrolü

**Action:**
`Excel'e Aktar` butonuna tıklanır.

**Data:**
Yok

**Expected Result:**
Dosya `otomatik_parametreler_[timestamp].xlsx` adıyla indirilmelidir. İndirilen dosya içeriği ekrandaki listeyle birebir aynı olmalıdır.

---

### TC-023 - Sayfalama fonksiyonları kontrolü

**Action:**
Sayfalama fonksiyonları test edilir.

**Data:**
Sayfa başına kayıt sayısı seçenekleri:

- 15
- 25
- 50
- 100

**Expected Result:**
Sayfa başına kayıt sayısı değiştirildiğinde liste dinamik olarak güncellenmelidir. `İlk`, `Geri`, `İleri`, `Son` butonları aktif çalışmalıdır.

---

### TC-024 - Filtreleme kontrolü

**Action:**
Filtreleme işlemi yapılır.

**Data:**
Filtre alanları:

- Tür
- Tür 2
- KDV Oranı

**Expected Result:**
Girilen kritere göre filtreleme yapılmalıdır. Liste dinamik olarak güncellenmelidir.

---

### TC-025 - Veri bütünlüğü kontrolü

**Action:**
Veri bütünlüğü kontrol edilir.

**Data:**
Yok

**Expected Result:**
İşlem Kodu, Tür, Tür 2 ve KDV Oranı ilişkileri tutarlı olmalıdır. Veri tekrarı bulunmamalıdır.

---

## Claude Code / Codex Kullanım Notu

Bu dosyadaki test case'leri Claude Code veya Codex ile otomasyona çevirmek için aşağıdaki talimatı kullan:

```text
Bu projede Cucumber + Playwright TypeScript kullanılıyor.
Eğer sen CLAUDE isen CLAUDE.md dosyasındaki mimari ve kurallara göre ilerle.
Eğer sen Codex isen AGENT.md dosyasındaki mimari ve kurallara göre ilerle.
Bu markdown dosyasındaki test case'leri sırayla otomasyona çevir.

Üretim sırası:
1. Önce `rg` ile mevcut step/flow/locator/action/assertion ara; varsa yenisini üretme.
2. Eksik locator veya step varsa doğru katmana küçük ve temiz ekleme yap.
3. Feature dosyasını `features/generated` altında business seviyesinde oluştur.
4. Step definition'ları `features/step-definitions` altında `Given/When/Then` ile yaz; mümkünse `src/flows` fonksiyonlarını çağır.

Önemli kurallar:
- Locator gerçek sayfada doğrulanmadan yazılmaz.
- TODO, placeholder step, boş assertion veya geçici locator bırakılmaz.
- Doğrulanamayan locator veya belirsiz expected result varsa o test üretilmez;
  bu promptta yapılan değişiklikler geri alınır ve engel raporlanır.
- `waitForTimeout` kullanılmaz.
- Hayali locator yazılmaz.
```
