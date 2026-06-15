# Otomasyon Üretim Prompt Şablonu (Tek Ağız)

Bu dosya, AI'a (Codex/Claude) manuel test case'i Cucumber + Playwright TypeScript
otomasyonuna çevirttiğimiz **tek standart prompt**'tur. Amaç: farklı kişi / branch /
makine fark etmeksizin herkesin aynı dilde çıktı üretmesi.

Kullanım:
1. Aşağıdaki **DOLDUR** bloğunu o turdaki teste göre doldur (tek değiştireceğin yer burası).
2. `DOLDUR` satırından dosyanın sonuna kadar olan her şeyi olduğu gibi AI'a yapıştır.
3. Statik kuralları (REUSE, ÇIKTI, LOCATOR DOĞRULAMA, ...) **değiştirme** — tek ağız bunlarla korunur.

---

## Prompt (buradan aşağısını kopyala)

Bu projede Cucumber + Playwright TypeScript kullanılıyor. Tüm mimari ve kodlama
kuralları AGENTS.md'de tanımlı; onları tekrar etmiyorum, AGENTS.md'ye göre ilerle.
Aşağıda sadece en kritik ve en çok atlanan kuralları öne çıkarıyorum.

### DOLDUR (sadece bu bloğu her turda değiştir)
- Manuel test dosyası: `[MANUEL_DOSYA].md`
- Ana test ID: `[ANA_TEST_ID]`
- Bu turda yapılacak TC'ler: `[TC-XXX, TC-YYY, ...]`
- Hariç TC'ler: Bu turda diğer tüm TC'ler hariç (`[açıkça say: TC-001 v1/v2, ...]`)
- Bu sayfanın domain'i / step dosyası: `[domain veya mevcut *.steps.ts]`

### REUSE (önce bunu yap)
- Yeni step/locator/action/assertion/flow yazmadan önce INVENTORY.md'yi oku;
  aradığın iş zaten varsa onu kullan, yenisini üretme.
- INVENTORY.md'de net değilse `rg` ile derinleş.
- Sidebar/menü erişimi için `navigation` grubunu ve genel
  "{string} menü yolundan sayfaya gidilir" step'ini kullan; sayfa bazlı
  navigasyon step'i yazma.
- Test sırasında seçilen/üretilen bir değeri sonraki adımda kullanacaksan
  `CustomWorld.store` (ScenarioStore) ile isimle sakla; `data.ts`'e veya
  feature'a hard-code etme. Generic save/use step + değer döndüren action
  deseni AGENTS.md 12.1'de.

### ÖN KOŞUL (reuse zorunlu — yeniden yazma)
- Login gerekiyorsa mevcut auth flow/step'ini kullan; yeni login akışı yazma.
- Test, bir formun/ekranın **açık olmasını** gerektiriyorsa (ör. dropdown'lar ancak
  "Oluştur/create" formu açıkken görünür), o ekrana ulaşmayı mevcut navigation +
  sayfa açma step'leriyle ön koşul olarak kur. Bu ön koşul adımlarını yeniden yazma,
  mevcut step/flow'ları reuse et.

### ÇIKTI
- Feature dosyası: `features/generated/[ANA_TEST_ID].feature`
  - Bu dosya **zaten varsa**: yeni TC'leri mevcut dosyaya Scenario olarak **ekle**.
    Dosyayı sıfırdan yazma, var olan senaryoları silme veya yeniden adlandırma.
- Step definition:
  - Bu test ID'ye ait yeni step'ler **mevcut `[domain veya *.steps.ts]`** dosyasına eklenir.
  - auth / navigation gibi ortak step'ler için ilgili mevcut dosya (`auth.steps.ts`,
    `navigation.steps.ts`) reuse edilir. Aynı işi yapan ikinci bir step dosyası açma.
- Feature formatı:
  - Her TC ayrı Scenario olur; Scenario adı TC ID ile başlar.
  - Adımlar `*` ile yazılır (Given/When/Then değil), business seviyesinde olur;
    locator/CSS/teknik detay içermez.
  - Tag'ler feature veya scenario üstünde yazılır.

  Örnek:
  ```gherkin
  @[tag]
  Feature: [ANA_TEST_ID] [Sayfa/Ekran Adı]

    Scenario: [TC_ID] - [senaryo adı]
      * [business adım]
      * [beklenen sonuç]
  ```

### LOCATOR DOĞRULAMA (AGENTS.md §6 — atlama)
- Yeni locator yazmadan önce Playwright MCP server (`playwright`) ile gerçek sayfada
  aç ve doğrula. Tahmin edilen selector doğrulanmadan koda yazılmaz.
- Locator seçim önceliği: getByTestId > getByRole > getByLabel > getByPlaceholder >
  getByText > CSS > XPath. `waitForTimeout` kullanma.
- Yeni locator eklediysen `LOCATOR_REPORTS` + `SELECTORS`/`TEXTS` tek kaynak kuralına uy.

### RAPORLAMA (yeni reusable action/assertion yazarsan — AGENTS.md §8-9)
- Yeni reusable action: `reportAction` + Playwright çağrısı try-catch içinde +
  hata durumunda `reportError` + `throw`. Hassas değerler (şifre vb.) maskelenir.
- Yeni reusable assertion: `reportAssertion` expect'ten **önce** + `expect(...)`
  try-catch içinde + `reportError` + `throw`.

### BİTİRİNCE
- Testi çalıştır; hata varsa minimum değişiklikle düzelt.
- `npm run check` çalıştır (typecheck + duplicate/reuse gate).
- Yeni locator/step eklediysen `npm run inventory` ile INVENTORY.md'yi güncelle ve
  değişikliklere dahil et.
- **Otomatik push etme.** Değişiklikleri commit/push için insan onayını bekle;
  sadece çalışan + doğrulanmış kodu bırak. (Bu sınır ekip tercihiyle değişebilir.)

### ENGEL DURUMU (AGENTS.md §5.3)
- Zorunlu locator gerçek sayfada doğrulanamıyor, expected result belirsiz veya akış
  mantıksızsa: testi kodda bırakma. Bu turda oluşturduğun feature/step/flow/action/
  assertion/locator değişikliklerini geri al (kullanıcının veya önceki branch'in
  işine dokunma) ve şu formatta raporla:

  ```text
  Bu test kodda bırakılmadı.
  Sebep: [doğrulanamayan locator / eksik yetki / beklenen sonuç belirsiz / ekran açılmıyor]
  Denendi: [login sonrası izlenen ekran yolu veya aksiyon]
  Gereken düzeltme: [doğru locator / yetki / test data / ekran yolu / beklenen sonuç]
  Geri alınanlar: [bu turda oluşturulan dosya veya değişiklik özeti]
  ```

DOLDUR bloğunda belirttiğim manuel test dosyasından, sadece "Bu turda yapılacak
TC'ler" listesindeki TC'leri otomasyona çevir. Hariç tutulanlara dokunma.

---

## Notlar (şablonu bakım yapan için — AI'a gönderme)

- **Senaryo isimlendirme:** Kural "Scenario adı TC ID ile başlar". Mevcut bazı
  feature'larda TC-ID'siz senaryo olabilir (ör. `YTKP-1009 - ...` = birleştirilmiş
  TC-001). Bunları yeniden adlandırmak ayrı/manuel bir karardır; AI'a "mevcut
  senaryoyu yeniden adlandırma" dedik, böylece güvenli kalıyor.
- **Step dosyası konvansiyonu:** Proje şu an domain-bazlı (`auth.steps.ts`,
  `navigation.steps.ts`) ve test-id-bazlı (`ytkp1009.steps.ts`) isimleri karışık
  kullanıyor. DOLDUR'daki "step dosyası" alanını mevcut dosyayı işaret edecek
  şekilde doldur ki AI ikinci bir dosya açmasın.
- **Commit sınırı:** Varsayılan "otomatik push etme". Ekip CI/branch akışına göre
  bu satırı değiştirebilir.
