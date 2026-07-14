# YTKP Deneme Test Case


## Test Cases

### TC-001 - GM Kasa Limit Girişi ekranına gidilir

**Action:**
Sol bardan MFYS > Merkezi Muhasebe Yönetim Sistemi > Tanımlama ve Yardımcı İşlemler > GM Kasa Limit Girişi ekranına gidilir.

**Data:**
Yok

**Expected Result:**
Sol barda `GM Kasa Limit Girişi`'nın seçildiği doğrulanır
Üstte `GM Para Limit Giriş Listesi` başlığı doğrulanır

---

### TC-002 - GM Kasa Limit Girişi ekranı kriter alanı paramatre doğrulama

**Action:**

**Data:**
Yok

**Expected Result:**
Bölge kodu dropdownın varlığı doğrulanır
Para türü dropdownın varlığı doğrulanır
Limit tutarı inputunun varlığı doğrulanır
---

### TC-003 - Kriter değer girişleri yapılır

**Action:**
Bölge kodu dropdownından 4.BÖLGE MÜDÜRLÜĞÜ seçilir
Para türü dropdownından AMERİKA DOLARI seçilir
Limit tutarı inputuna 115000 değeri girilir

**Data:**
Yok

**Expected Result:**
Bölge kodu dropdownından 4.BÖLGE MÜDÜRLÜĞÜ seçildiği doğrulanır
Para türü dropdownından AMERİKA DOLARI seçildiği doğrulanır
Limit tutarı inputuna 115000 değeri girildiği doğrulanır

---

### TC-004 - Filtreleme ve sonrası doğrulama

**Action:**
Filtrele butonuna tıklanır

**Data:**
Yok

**Expected Result:**
Bölge adı liste başlığının görüldüğü doğrulanır
Para Türü liste başlığının görüldüğü doğrulanır

---