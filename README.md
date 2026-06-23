# UI Automation

Cucumber + Playwright + TypeScript ile yazılmış UI otomasyon projesidir. Amaç, manuel test case'leri okunabilir, tekrar kullanılabilir ve bakımı kolay Cucumber senaryolarına dönüştürmektir.

Bu repoda klasik Page Object Model kullanılmaz. Test mimarisi data, locator, action, assertion ve flow katmanları üzerinden ilerler. Kod üretim ve bakım kurallarının ana kaynağı [AGENTS.md](./AGENTS.md) dosyasıdır.

## Teknoloji

- TypeScript
- Playwright
- Cucumber / Gherkin
- `@cucumber/cucumber`
- `ts-node`
- `dotenv`

## Proje Yapısı

```text
features/
  cases/                 # Cucumber feature dosyaları
    smoke/               # Kritik smoke case'leri
    regression/          # Regression case'leri
  step-definitions/      # Gherkin step karşılıkları
  support/               # World, hook, formatter ve raporlama desteği

src/
  actions/               # Reusable kullanıcı aksiyonları
  assertions/            # Reusable doğrulamalar
  config/                # Environment ayarları
  data/                  # Test verisi ve env kullanıcı okuma
  flows/                 # Business akışları
  locators/              # Reusable locator tanımları ve locator rapor metadatası
  utils/                 # Ortak raporlama/console yardımcıları

scripts/
  check-inventory.ts     # Step/locator/action/flow envanteri ve duplicate kontrolü
```

Ana akış:

```text
Feature -> Step Definition -> Flow -> Action / Assertion -> Locator / Data
```

## Kurulum

```powershell
npm install
```

Ortam dosyasını oluştur:

```powershell
Copy-Item .env.example .env
```

`.env` içinde en az şu değerler tanımlanmalıdır:

```env
BASE_URL="https://example.test/shell-app-ui/#/journal-audits"
RUNNING_ENV=test
BROWSER=chromium
HEADED=false

USER1_USERNAME=
USER1_PASSWORD=
```

Kullanıcı bilgileri `USER<N>_USERNAME` / `USER<N>_PASSWORD` bloklarıyla okunur. Feature dosyasında kullanıcı, blok anahtarı ile seçilir: `"USER1" kullanıcısı ile login olunur` step'i `.env` içindeki `USER1_USERNAME` ve `USER1_PASSWORD` değerlerini kullanır; gerçek kullanıcı adı veya şifre feature'a yazılmaz.

## Test Çalıştırma

```powershell
npm test
npm run test:smoke
npm run test:regression
```

Tarayıcı bazlı çalıştırma:

```powershell
npm run test:chromium
npm run test:firefox
npm run test:webkit
npm run test:all
```

Görsel/debug çalıştırma:

```powershell
npm run test:headed
npm run test:debug
```

Rapor çıktıları:

```text
cucumber-report.html
cucumber-report.json
```

## Kalite Kontrolleri

TypeScript kontrolü:

```powershell
npm run typecheck
```

Inventory güncelleme:

```powershell
npm run inventory
```

Inventory güncellik ve duplicate kontrolü:

```powershell
npm run inventory:check
```

Tüm temel kontrol:

```powershell
npm run check
```

`npm run check`, `typecheck` ve `inventory:check` komutlarını birlikte çalıştırır. Yeni step, locator, action veya flow eklendikten sonra `npm run inventory` çalıştırılmalı ve güncellenen [INVENTORY.md](./INVENTORY.md) dosyası commit'e dahil edilmelidir.

## Zorunlu Bitirme Ritüeli

Yeni test veya locator değişikliği tamamlanmış sayılmadan önce şu kontroller yapılmalıdır:

1. Yeni veya değişen locator gerçek uygulamada Playwright MCP ile doğrulanır.
2. Yeni step, locator, action veya flow eklendiyse `npm run inventory` çalıştırılır.
3. `npm run check` temiz geçer. Windows PowerShell `npm.ps1` execution policy nedeniyle engellerse `npm.cmd run check` kullanılır.
4. İlgili scenario/feature veya tüm suite çalıştırılır ve sonuç raporu kontrol edilir.

Bu kontrollerden biri yapılamıyorsa test kodda yarım bırakılmaz; engel net şekilde raporlanır.

## Inventory ve Reuse

[INVENTORY.md](./INVENTORY.md), mevcut step, locator, action ve flow sözlüğünü listeler. Yeni test yazmadan önce önce bu dosyada, gerekirse `rg` ile kod içinde reuse aranmalıdır.

Önerilen aramalar:

```powershell
rg "Oluştur|Kaydet|Sil|Ara|Temizle|Vazgeç|Onayla|Geri" src features
rg "step metni veya beklenen ekran başlığı" features src
rg "locator adı veya UI metni" src/locators src/actions src/assertions src/flows features/step-definitions
```

Inventory kontrolü şu durumları yakalar:

- Aynı selector'ın farklı locator isimleriyle tekrar tanımlanması
- `LOCATOR_REPORTS` içindeki `name` değerinin kendi `grup.key` yolu ile uyuşmaması
- Normalize edildiğinde aynı metne düşen step tanımları
- `INVENTORY.md` dosyasının güncel olmaması

## Yeni Test Ekleme Akışı

1. Manuel test case ve beklenen sonucu netleştir.
2. [INVENTORY.md](./INVENTORY.md) içinde mevcut step, locator, action ve flow reuse'u ara.
3. Gerekirse `rg` ile derin arama yap.
4. Locator'ı gerçek uygulamada doğrula.
5. Feature dosyasını test tipine göre `features/cases/smoke` veya `features/cases/regression` altına ekle veya güncelle.
6. Step definition içinde locator veya Playwright detayı yazma; mümkünse flow çağır.
7. Gerekli action, assertion, locator ve data eklemelerini mevcut katmanlara yap.
8. Yeni locator eklendiyse `LOCATOR_REPORTS` metadatasını da ekle.
9. `npm run inventory` ve `npm run check` çalıştır.

Belirsiz locator, yetki, veri veya beklenen sonuç varsa koda TODO, geçici selector veya boş step bırakılmaz. Bu durumda ekleme geri alınır ve engel net şekilde raporlanır.

## AI ile Test Üretimi

Ekip, manuel test case'leri AI ile otomasyona çevirirken tek standart prompt dosyasını kullanır:

```text
docs/prompt-template.md
```

Kullanım:

```text
docs/prompt-template.md dosyasındaki promptu uygula.
```

Prompt dosyasında sadece `DOLDUR` alanı ilgili test turuna göre güncellenir. Senaryonun mevcut akışa mı ekleneceği, mevcut feature içinde yeni scenario mu açılacağı veya yeni feature mı oluşturulacağı `Senaryo islemi` alanıyla belirtilir. Karar net değilse `repo yapisindan karar ver` yazılır; AI mevcut repo yapısını inceler, emin olamazsa tahminle kod yazmaz ve blokaj raporlar.

## Mevcut Senaryolar

- `features/cases/smoke/TC_001_login.feature`: Geçerli kullanıcı ile login kontrolü
- `features/cases/regression/YTKP-1009.feature`: Otomatik Parametre Tanımlama ekranına erişim, oluşturma ekranı yönlendirmesi, İşlem Kodu dropdown formatı, İşlem Kodu seçimine göre alan aktif/pasif kontrolleri, Fiş Açıklama validasyonları ve Tür / Tür 2 / KDV Oranı seçenek doğrulamaları

## Mimari Notlar

- Feature dosyalarında step keyword olarak `*` kullanılır.
- Step definition dosyalarında `Given`, `When`, `Then` kullanılır.
- Klasik `pages/LoginPage.ts` gibi Page Object dosyaları oluşturulmaz.
- Ortak sidebar menü geçişleri `features/step-definitions/navigation.steps.ts` içindeki genel step ile yapılır.
- Action dosyası assertion içermez.
- Assertion dosyası click/fill gibi kullanıcı aksiyonu içermez.
- Reusable action ve assertion'lar Cucumber raporuna locator adı, locator değeri ve beklenen sonucu yazar.
- Şifre gibi hassas değerler raporlarda maskelenir.
- Test sırasında yakalanan dinamik değerler (seçilen dropdown, okunan text/attribute) `ScenarioStore` (`World.store`) ile isimle saklanıp sonraki adımlarda kullanılır; `data.ts`'e veya feature'a hard-code edilmez. Detay: AGENTS.md 12.1.

Detaylı standartlar için [AGENTS.md](./AGENTS.md) referans alınmalıdır.
