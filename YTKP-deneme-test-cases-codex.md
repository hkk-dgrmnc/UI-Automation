# YTKP Deneme Test Case


## Test Cases

### TC-001 - Kimlik Şablonu ekranı açılış kontrolü

**Action:**
Sol bardan Posta Çeki Hesabı İşlemleri > Kimlik Şablonu ekranına gidilir.

**Data:**
Yok

**Expected Result:**
Sol barda `Kimlik Şablonu`'nın seçildiği doğrulanır
Kimlik Şablonu ekranın açıldığı doğrulanır
Üstte `Kimlik Şablonu` başlığı, altta oluşturulan Adres Şablonu tablosunda `Kod` ve `Hesap Adı` başlıkları doğrulanır (Not: O alan boş da olabilir oluşturulmuş dinamik değerlerde olabilir !)

---

### TC-002 - Kimlik Şablonu Oluştur buton kontrolü

**Action:**
Oluştur butonuna tıklanır

**Data:**
Yok

**Expected Result:**
`Kimlik Türü Tanım` bağlığı geldiği doğrulanır
Sayfada "Kod" ve "Hesap Adı" input alanlarının varlığı doğrulanır
Ekle butonunun varlığı doğrulanır
`Alanlar` başlığı ve alanının geldiği doğrulanır (Not: O alan boş da olabilir oluşturulmuş dinamik değerlerde olabilir !)

---

### TC-003 - Türkçe olmayan kelime sorgusu

**Action:**
Bulunduğun sayfada türkçe olmayan kelime var mı kontrol edililir

**Data:**
Yok

**Expected Result:**
SaBulunduğun sayfada türkçe olmayan kelimenin olmadığı doğrulanır

---