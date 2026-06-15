# UI Automation Projesi

Bu sayfa, UI Automation projesinin Confluence üzerinde paylaşılabilecek özet açıklamasıdır. Teknik kural kitabı [AGENTS.md](../AGENTS.md), geliştirici onboarding dokümanı ise [README.md](../README.md) olarak repoda tutulur.

## Amaç

UI Automation projesi, manuel test case'leri Cucumber + Playwright + TypeScript altyapısı ile otomasyona dönüştürmek için oluşturulmuştur.

Hedefler:

- Manuel test adımlarını business seviyesinde okunabilir Gherkin senaryolarına çevirmek
- Testleri hızlı, stabil ve tekrar kullanılabilir hale getirmek
- Locator, action, assertion ve flow tekrarını kontrol altında tutmak
- Farklı ekip üyelerinin aynı otomasyon diliyle test üretmesini sağlamak
- Cucumber raporlarında aksiyon, assertion ve locator detaylarını izlenebilir hale getirmek

## Kullanılan Teknolojiler

| Alan | Teknoloji |
| --- | --- |
| Dil | TypeScript |
| Browser automation | Playwright |
| Test runner | Cucumber |
| Senaryo dili | Gherkin |
| Environment yönetimi | dotenv |
| Raporlama | Cucumber HTML/JSON raporları ve custom console formatter |

## Mimari Yaklaşım

Bu projede klasik Page Object Model kullanılmaz. Her sayfa için ayrı `Page.ts` class dosyası açmak yerine başlangıç mimarisi sade tutulur:

```text
Feature
  -> Step Definition
    -> Flow
      -> Action
        -> Locator
      -> Assertion
        -> Locator
      -> Data
```

Katmanların sorumlulukları:

| Katman | Sorumluluk |
| --- | --- |
| `features/generated` | Manuel test case'lerden üretilen Cucumber feature dosyaları |
| `features/step-definitions` | Gherkin adımlarının TypeScript karşılıkları |
| `src/flows` | Birden fazla action/assertion içeren business akışları |
| `src/actions/actions.ts` | Reusable kullanıcı aksiyonları |
| `src/assertions/assertions.ts` | Reusable doğrulamalar |
| `src/locators/locators.ts` | Reusable locator tanımları ve rapor metadatası |
| `src/data/data.ts` | Test datası ve env kullanıcı bilgisi okuma |
| `features/support` | Browser lifecycle, World, hook ve raporlama altyapısı |

## Neden Klasik POM Kullanılmıyor?

Bu projenin başlangıç ihtiyacı hızlı test üretimi, sade dosya yapısı ve ortak otomasyon sözlüğüdür. Bu yüzden her ekran için `LoginPage`, `HomePage`, `BasketPage` gibi class dosyaları açılmıyor.

Bunun yerine locator, action ve assertion'lar tek merkezde tutuluyor. Proje büyüdüğünde hedef yine klasik POM'a dönmek değil; ihtiyaç oluşan katmanları domain bazlı bölmek:

```text
src/actions/auth.actions.ts
src/actions/product.actions.ts
src/assertions/auth.assertions.ts
src/locators/auth.locators.ts
```

Bu geçiş yalnızca dosyalar büyüdüğünde, bakım zorlaştığında veya belirgin domain ayrımı oluştuğunda yapılmalıdır.

## Test Üretim Standardı

Yeni bir otomasyon senaryosu eklenirken izlenen akış:

1. Manuel test case ve expected result netleştirilir.
2. Mevcut step, locator, action ve flow tekrar kullanılabilir mi diye `INVENTORY.md` kontrol edilir.
3. Gerekirse `rg` ile kod içinde detaylı arama yapılır.
4. Locator gerçek uygulamada doğrulanır.
5. Feature dosyası `features/generated` altına eklenir.
6. Step definition içinde teknik Playwright detayı yazılmaz; mümkün olduğunca flow çağrılır.
7. Gerekli action, assertion, locator ve data mevcut katmanlara eklenir.
8. Yeni locator eklendiyse `LOCATOR_REPORTS` içine rapor metadatası da eklenir.
9. `npm run inventory` ve `npm run check` çalıştırılır.

## Reuse ve Standartlaşma

Projede aynı işi yapan farklı step veya locator isimleri oluşturulmamalıdır. Bunun için `INVENTORY.md` otomatik üretilen merkezi sözlük olarak kullanılır.

Inventory içinde şunlar listelenir:

- Mevcut Cucumber step tanımları
- Locator isimleri ve selector değerleri
- Reusable action fonksiyonları
- Flow fonksiyonları

`npm run check` aşağıdaki kontrolleri yapar:

- TypeScript derleme kontrolü
- Duplicate locator selector kontrolü
- Duplicate/normalize edilmiş step metni kontrolü
- `LOCATOR_REPORTS` isim uyumu kontrolü
- `INVENTORY.md` güncellik kontrolü

Bu sayede farklı branch veya farklı ekip üyeleri aynı iş için birbirinden kopuk otomasyon dili üretmez.

## Locator Politikası

Locator seçim önceliği:

1. `getByTestId`
2. `getByRole`
3. `getByLabel`
4. `getByPlaceholder`
5. `getByText`
6. CSS locator
7. XPath, yalnızca zorunluysa

Hayali locator, geçici selector veya doğrulanmamış element koda eklenmez. Locator gerçek uygulamada doğrulanamıyorsa test kodda bırakılmaz; engel net şekilde raporlanır.

## Raporlama

Test çalıştırıldığında Cucumber HTML ve JSON raporları oluşur:

```text
cucumber-report.html
cucumber-report.json
```

Reusable action ve assertion fonksiyonları rapora şu bilgileri ekler:

- Yapılan işlem veya doğrulama
- Locator adı
- Locator değeri
- Beklenen sonuç
- Gerekliyse girilen değer

Şifre gibi hassas değerler raporda maskelenir.

## Çalıştırma Komutları

```powershell
npm test
npm run test:chromium
npm run test:firefox
npm run test:webkit
npm run test:headed
npm run test:debug
npm run check
```

## Bakım Kuralları

- Feature dosyaları business seviyesinde okunur kalmalıdır.
- Step definition içinde locator veya Playwright detayı yazılmamalıdır.
- Ortak menü geçişleri için genel navigation step'i kullanılmalıdır.
- Yeni locator eklenirse `LOCATOR_REPORTS` da güncellenmelidir.
- Yeni step/locator/action/flow sonrası `npm run inventory` çalıştırılmalıdır.
- Commit öncesi `npm run check` temiz geçmelidir.
- Belirsiz expected result, eksik yetki, doğrulanamayan locator veya eksik test data varsa koda TODO/placeholder bırakılmamalıdır.
- Test sırasında yakalanan dinamik değerler (seçilen dropdown, okunan text/attribute) `ScenarioStore` (`World.store`) ile saklanır; `data.ts`'e veya feature'a hard-code edilmez.

## Kısa Özet

Bu proje, manuel testlerin sürdürülebilir UI otomasyonuna dönüşmesi için ortak bir dil ve kontrollü bir mimari sağlar. Cucumber senaryoları iş akışını okunur tutar, Playwright uygulama etkileşimlerini yürütür, TypeScript katmanları reuse'u yönetir ve inventory/check mekanizması ekip genelinde standartlaşmayı korur.
