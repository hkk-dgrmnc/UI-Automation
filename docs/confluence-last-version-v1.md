# UI Automation - Playwright + Cucumber Test Otomasyon Standardı

## Sayfa Bilgisi

| Alan | Değer |
| --- | --- |
| Doküman adı | UI Automation - Playwright + Cucumber Test Otomasyon Standardı |
| Durum | Aktif kullanımda |
| Versiyon | v1.0 |
| Son güncelleme | 23 Haziran 2026 |
| Sahip | QA Automation Ekibi |
| Hedef kitle | QA ekipleri, geliştiriciler, teknik liderler, AI destekli test üretimi yapan ekip üyeleri |
| Ana kaynak | `AGENTS.md` |
| Yardımcı kaynaklar | `README.md`, `INVENTORY.md`, `docs/prompt-template.md` |

Bu sayfa, UI Automation projesinin mimari yaklaşımını, test üretim standardını, tekrar kullanım kurallarını ve kalite kapılarını Confluence üzerinde ortak referans haline getirmek için hazırlanmıştır.

> Not: Bu Confluence sayfası ekip içi özet ve çalışma standardıdır. Detaylı ve bağlayıcı teknik kurallar için ana kaynak repodaki `AGENTS.md` dosyasıdır.

## İlgili Kaynaklar

| Kaynak | Amaç |
| --- | --- |
| [AGENTS.md](../AGENTS.md) | Kod üretim kuralları, mimari kararlar ve AI çalışma standardı |
| [README.md](../README.md) | Kurulum, çalıştırma ve geliştirici onboarding bilgisi |
| [INVENTORY.md](../INVENTORY.md) | Mevcut step, locator, action ve flow sözlüğü |
| [docs/prompt-template.md](./prompt-template.md) | Manuel test senaryolarını otomasyona çevirme prompt şablonu |
| [YTKP-1009-test-cases-codex.md](../YTKP-1009-test-cases-codex.md) | Örnek manuel test senaryosu dokümanı |

## Confluence Yerleşim Önerisi

Önerilen sayfa hiyerarşisi:

```text
QA Knowledge Base
  -> Test Automation
    -> UI Automation - Playwright + Cucumber Test Otomasyon Standardı
    -> UI Automation - Prompt Template
    -> UI Automation - Inventory / Reuse Sözlüğü
```

Önerilen etiketler:

```text
ui-automation
playwright
cucumber
typescript
qa-automation
codex
test-standard
```

## Özet

Bu proje, manuel UI test case'lerini Cucumber + Playwright + TypeScript ile okunabilir, tekrar kullanılabilir ve bakımı kolay otomasyon testlerine dönüştürmek için kurulmuştur.

Temel hedefler:

- Manuel test adımlarını iş dilinde okunan Gherkin senaryolarına çevirmek.
- Locator, step, action, assertion ve flow tekrarını azaltmak.
- AI destekli test üretimini kontrollü ve denetlenebilir hale getirmek.
- Test raporlarını teknik ve teknik olmayan okuyucular için anlaşılır yapmak.
- Proje büyürken klasik Page Object Model'e dönmeden katmanları domain bazlı yönetmek.

## Kapsam

Bu standart aşağıdaki alanları kapsar:

| Alan | Kapsam |
| --- | --- |
| UI test otomasyonu | Web arayüzünün Playwright ile otomasyonu |
| Senaryo dili | Cucumber + Gherkin feature dosyaları |
| Kodlama dili | TypeScript |
| Test verisi | `.env` ve `src/data/data.ts` üzerinden yönetim |
| Locator yönetimi | Tek kaynak: `src/locators/locators.ts` |
| Aksiyon ve doğrulama | Domain bazlı action/assertion katmanları |
| Akış yönetimi | `src/flows` içindeki business flow fonksiyonları |
| Raporlama | Cucumber HTML/JSON raporu ve reusable action/assertion logları |
| Kalite kontrolleri | TypeScript check, inventory check, duplicate step/locator kontrolü |
| AI kullanımı | Codex/Claude gibi araçlarla kurallı test üretimi |

Kapsam dışı alanlar:

- API test otomasyonu.
- Performans, yük, güvenlik veya erişilebilirlik testleri.
- Gauge runner veya Gauge concept dosyaları.
- Klasik Page Object Model ve ekran bazlı `Page` class yapısı.
- Hassas kullanıcı bilgilerinin repoda tutulması.

## Teknoloji Yığını

| Alan | Teknoloji |
| --- | --- |
| Dil | TypeScript |
| Browser otomasyonu | Playwright |
| Test runner | Cucumber |
| Senaryo dili | Gherkin |
| Step framework | `@cucumber/cucumber` |
| Environment yönetimi | `dotenv` |
| Raporlama | Cucumber HTML/JSON + özel action/assertion raporlama |
| AI destekli locator doğrulama | Playwright MCP |
| Kalite kontrol | `npm run check`, `npm run inventory` |

Kullanılmayacak yapılar:

- Gauge runner.
- Klasik Page Object Model.
- Her sayfa için ayrı `LoginPage`, `HomePage`, `BasketPage` gibi class dosyaları.
- Gereksiz abstraction.
- `waitForTimeout`.
- Hayali veya doğrulanmamış locator.

## Mimari Yaklaşım

Proje klasik Page Object Model kullanmaz. Bunun yerine test otomasyonu aşağıdaki katmanlara ayrılır:

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

Katman sorumlulukları:

| Katman | Konum | Sorumluluk |
| --- | --- | --- |
| Feature | `features/generated/` | Manuel test case'lerden üretilen, iş dilinde okunan senaryolar |
| Step Definition | `features/step-definitions/` | Gherkin adımını TypeScript akışına bağlar |
| Flow | `src/flows/` | Birden fazla action/assertion içeren business akışları |
| Action | `src/actions/` | Kullanıcı aksiyonlarını reusable fonksiyonlarla yönetir |
| Assertion | `src/assertions/` | Playwright web-first assertion'ları reusable hale getirir |
| Locator | `src/locators/locators.ts` | Element locator'ları ve rapor metadata bilgisini tek kaynakta tutar |
| Data | `src/data/data.ts` | Statik test verisi ve `.env` kullanıcı okuma fonksiyonlarını tutar |
| Support | `features/support/` | World, hooks, browser lifecycle, ScenarioStore ve raporlama bağlantıları |
| Config | `src/config/` | Ortam ve environment ayarları |

## Klasör Yapısı

```text
playwright-automation/
|
+-- AGENTS.md
+-- README.md
+-- INVENTORY.md
+-- cucumber.js
+-- package.json
+-- tsconfig.json
|
+-- docs/
|   +-- prompt-template.md
|   +-- confluence-ui-automation-standard.md
|
+-- features/
|   +-- generated/
|   +-- step-definitions/
|   +-- support/
|
+-- src/
|   +-- actions/
|   +-- assertions/
|   +-- config/
|   +-- data/
|   +-- flows/
|   +-- locators/
|   +-- utils/
|
+-- scripts/
```

Mevcut durumda:

| Katman | Durum |
| --- | --- |
| `src/actions/` | Domain bazlı ayrılmıştır: `common`, `auth`, `navigation`, `automaticParameters` |
| `src/assertions/` | Domain bazlı ayrılmıştır: `common`, `auth`, `automaticParameters` |
| `src/data/data.ts` | Tek dosya olarak korunur |
| `src/locators/locators.ts` | Tek dosya olarak korunur |

## Neden Klasik POM Kullanılmıyor?

Bu projede her ekran için ayrı `Page` class dosyası oluşturulmaz. Başlangıç hedefi hızlı test üretimi, sade dosya yapısı ve ortak otomasyon sözlüğüdür.

Kullanılmayan örnek yaklaşım:

```text
pages/
  LoginPage.ts
  HomePage.ts
  ProductListPage.ts
  BasketPage.ts
  CheckoutPage.ts
```

Tercih edilen yaklaşım:

- Locator'lar tek kaynakta yönetilir.
- Kullanıcı hareketleri action katmanında tutulur.
- Doğrulamalar assertion katmanında tutulur.
- Birden fazla adımdan oluşan iş akışları flow katmanına taşınır.
- Proje büyüdükçe POM'a dönülmez; sadece ihtiyaç olan katman domain bazlı ayrılır.

## Büyüme Stratejisi

Tek dosya modeli başlangıç için bilinçli bir tercihtir, kalıcı hedef değildir. Bir katman büyüme eşiğini geçtiğinde domain bazlı dosyalara ayrılır.

Büyüme eşiği örnekleri:

- Bir dosyanın yaklaşık 200-300 satırı geçmesi.
- Aynı domain için 10 veya daha fazla locator, action, assertion veya data grubu oluşması.
- Dosya içinde `auth`, `product`, `basket`, `checkout` gibi domain bloklarının belirgin şekilde büyümesi.
- Aynı dosyada değişiklik yapmanın conflict veya yanlış düzenleme riski oluşturması.

Ayrım kuralları:

- Ayrım sadece ihtiyaç olan katmanda yapılır.
- POM class oluşturulmaz.
- `pages/` klasörü açılmaz.
- Mevcut test davranışı korunur.
- Import değişiklikleri minimum tutulur.
- Aynı fonksiyon iki yerde bırakılmaz.

## Ortak Otomasyon Dili ve Reuse

Bu projede farklı kişiler veya farklı AI oturumları aynı otomasyon dilini kullanmalıdır. Bu nedenle yeni test yazmadan önce mevcut sözlük aranır.

Öncelikli kaynak:

```text
INVENTORY.md
```

Derin arama örnekleri:

```powershell
rg "Oluştur|Kaydet|Sil|Ara|Temizle|Vazgeç|Onayla|Geri" src features
rg "step metni veya beklenen ekran başlığı" features src
rg "locator adı veya UI metni" src/locators src/actions src/assertions src/flows features/step-definitions
```

Reuse karar sırası:

1. Aynı business step varsa mevcut step metni kullanılır.
2. Aynı locator varsa mevcut locator kullanılır.
3. Aynı action, assertion veya flow varsa mevcut fonksiyon kullanılır.
4. Ortak UI elemanıysa `common` veya `navigation` grubuna eklenir.
5. Sadece ilgili sayfaya aitse ilgili domain grubunda tutulur.
6. Gerçekten yeni ihtiyaçsa doğru katmana küçük ve temiz ekleme yapılır.

## Inventory ve Mekanik Kontroller

`INVENTORY.md`, mevcut step, locator, action ve flow sözlüğünü tek yerde listeler. Yeni step veya locator eklendikten sonra güncellenmelidir.

Komutlar:

```powershell
npm run inventory
npm run check
```

`npm run check` aşağıdaki durumlarda hata verir:

| Kontrol | Yakaladığı durum |
| --- | --- |
| Duplicate selector | Aynı selector iki farklı locator isminde tanımlanmışsa |
| Locator report name/path uyumu | `LOCATOR_REPORTS` içindeki `name`, kendi `grup.key` yolu ile uyuşmuyorsa |
| Duplicate step | Normalize edildiğinde aynı metne düşen iki step tanımı varsa |
| Inventory güncelliği | Locator veya step eklenip `INVENTORY.md` güncellenmemişse |
| TypeScript hatası | `tsc --noEmit` başarısızsa |

## Ortak UI ve Navigasyon Standardı

Ortak kabul edilen elemanlar:

- Birden fazla sayfada aynı selector, aynı rol veya aynı davranışla kullanılan elemanlar.
- `Oluştur`, `Kaydet`, `Sil`, `Ara`, `Temizle`, `Vazgeç`, `Onayla`, `Geri` gibi global toolbar/form aksiyonları.
- Sidebar menu açma, menu path takip etme, seçili menu linkini doğrulama gibi navigasyon davranışları.

Örnek locator standardı:

```ts
locators(page).common.createLink
locators(page).navigation.sidebarMenuButton('MFYS')
locators(page).navigation.sidebarMenuLink('Otomatik Parametre Tanımlama')
locators(page).navigation.selectedSidebarMenuLink('Otomatik Parametre Tanımlama')
locators(page).automaticParameters.listTitle
```

Sidebar navigasyon için sayfa bazlı özel step yazılmaz. Genel step kullanılır:

```gherkin
* "MFYS > Genel Parametre Ayarları > Tanımlama İşlemleri > Otomatik Parametre Tanımlama" menü yolundan sayfaya gidilir
```

Format:

```text
"Üst Menü > Alt Menü > ... > Sayfa Adı"
```

Son eleman tıklanacak linktir, önceki tüm elemanlar sırayla açılacak parent menülerdir. Step derinlikten bağımsızdır.

## Locator Yazım Standardı

Locator tanımları `src/locators/locators.ts` içinde tutulur.

Locator seçim önceliği:

1. `getByTestId`
2. `getByRole`
3. `getByLabel`
4. `getByPlaceholder`
5. `getByText`
6. CSS locator
7. XPath, sadece zorunluysa

Kaçınılacak örnekler:

```ts
page.locator('div:nth-child(3) > button')
page.locator('//div[4]/span[2]/button')
page.locator('.css-1x2y3z')
```

Tercih edilen örnekler:

```ts
page.getByTestId('login-button')
page.getByRole('button', { name: 'Giriş Yap' })
page.getByLabel('E-posta')
page.getByPlaceholder('Ürün ara')
page.getByText('Sepete Ekle')
```

Kurallar:

- Hayali locator yazılmaz.
- Locator gerçek sayfada doğrulanmadan koda alınmaz.
- Yeni locator Playwright MCP ile gerçek uygulamada doğrulanır.
- Aynı locator tekrar kullanılacaksa `src/locators/locators.ts` içine alınır.
- Her locator için `LOCATOR_REPORTS` metadata bilgisi eklenir.
- Selector ve UI metinleri `SELECTORS` / `TEXTS` sabitlerinde tek kaynak olarak tutulur.

## Data ve Hassas Bilgi Yönetimi

Test dataları `src/data/data.ts` içinde tutulur. Hassas bilgiler feature dosyasına veya koda yazılmaz.

Kullanıcı bilgileri `.env` içinde numaralı kullanıcı blokları olarak tutulur:

```env
USER1_USERNAME=
USER1_PASSWORD=
```

Feature veya step tarafında kullanıcı `"USER1"` gibi blok anahtarıyla seçilir. Gerçek kullanıcı adı ve şifre commit edilmez.

Kurallar:

- Gerçek kullanıcı adı ve şifre feature dosyasına yazılmaz.
- Ortama göre değişen değerler environment variable üzerinden alınır.
- Statik test verisi `src/data/data.ts` içinde tutulur.
- Test sırasında yakalanan runtime değerler `data.ts` içine yazılmaz.
- Runtime değerler `CustomWorld.store` yani `ScenarioStore` ile yönetilir.

## Action Standardı

Action fonksiyonları `src/actions/` altında domain bazlı dosyalarda tutulur.

Örnek dosyalar:

```text
src/actions/common.actions.ts
src/actions/auth.actions.ts
src/actions/navigation.actions.ts
src/actions/automaticParameters.actions.ts
```

Action kuralları:

- Action sadece kullanıcı işlemi yapar.
- Assertion içermez.
- `click`, `fill`, `press`, `selectOption`, `hover` gibi kullanıcı aksiyonları action katmanında yer alabilir.
- Ortak primitive'ler `common.actions.ts` içinde tutulur.
- Reusable action raporlanabilir olmalıdır.
- Hata durumunda `reportError` ile bilgi yazılır ve hata yeniden fırlatılır.
- Şifre, token veya gizli değerler raporda maskelenir.
- Fonksiyon isimlerine `WithReport`, `WithLog`, `Reported` gibi ekler eklenmez.

Örnek isimlendirme:

```ts
openSidebarMenuPath(page, ['MFYS', 'Genel Parametre Ayarları'], 'Hedef Ekran')
clickSidebarMenuLink(page, 'Hedef Ekran')
clickCreateLink(page)
```

## Assertion Standardı

Assertion fonksiyonları `src/assertions/` altında domain bazlı dosyalarda tutulur.

Örnek dosyalar:

```text
src/assertions/common.assertions.ts
src/assertions/auth.assertions.ts
src/assertions/automaticParameters.assertions.ts
```

Assertion kuralları:

- Playwright web-first assertion kullanılmalıdır.
- `expect(locator).toBeVisible()` gibi retry mekanizmalı assertion'lar tercih edilir.
- `expect(await locator.isVisible()).toBe(true)` kullanımından kaçınılır.
- Assertion sadece doğrulama yapar.
- Click/fill gibi action içermez.
- Reusable assertion raporlanabilir olmalıdır.
- Rapor, expect çağrısından önce yazılır.
- Business expected result netse assertion buna göre yazılır.

İyi örnekler:

```ts
await expect(page).toHaveURL(/shell-app-ui\/#\/journal-audits/);
await expect(locator.auth.userProfileButton).toBeVisible();
await expect(locator.auth.usernameInput).not.toBeVisible();
```

## Liste ve Dropdown Doğrulama Standardı

Dropdown veya listbox seçenek doğrulaması için sayfa bazlı özel assertion ve özel step yazılmaz. Generic step ve generic assertion kullanılır.

Kullanılacak yapı:

```text
Step       -> features/step-definitions/common.steps.ts
Assertion  -> src/assertions/common.assertions.ts
Locator    -> src/locators/locators.ts
```

Feature örneği:

```gherkin
* Tür dropdown'ı açılır
* "Tür" listesinde aşağıdaki seçenekler listelenir
  | MERKEZ |
  | BAŞMÜDÜRLÜK |
  | GENEL MÜDÜRLÜK |
```

Kurallar:

- Beklenen seçenek listesi feature dosyasında Data Table olarak verilir.
- Beklenen seçenek listesi koda gömülmez.
- Generic step, verilen seçeneklerin ilgili listbox içinde göründüğünü doğrular.
- "Tam N adet seçenek vardır" gibi daha güçlü ihtiyaçlar varsa amaca özel assertion yazılabilir.

## Flow Standardı

Flow dosyaları `src/flows` altında tutulur. Flow, birden fazla action ve assertion içeren business akışıdır.

Flow kuralları:

- Flow, business anlamlı akışları temsil eder.
- Step definition mümkünse flow çağırır.
- Flow içinde action ve assertion akışı okunabilir tutulur.
- Locator detayı flow içine taşınmaz.
- Gereksiz mikro flow oluşturulmaz.

Örnek:

```text
features/generated/TC_001_login.feature
  -> features/step-definitions/auth.steps.ts
    -> src/flows/auth.flow.ts
      -> src/actions/auth.actions.ts
      -> src/assertions/auth.assertions.ts
```

## Cucumber Step Definition Standardı

Step definition dosyaları `features/step-definitions` altında bulunur.

Kurallar:

- Feature dosyalarında step keyword olarak sadece `*` kullanılır.
- Step definition dosyalarında anlamına göre `Given`, `When`, `Then` kullanılabilir.
- `defineStep as Step` kullanılmaz.
- Step definition teknik locator veya Playwright detayı içermez.
- Step definition mümkünse flow çağırır.
- `getPage(world)` helper'ı `features/support/world.ts` içinden import edilir, her dosyada tekrar tanımlanmaz.

Step metni kuralları:

- Türkçe, kısa ve business seviyesinde olmalıdır.
- Aynı anlama gelen farklı step metinleri üretilmemelidir.
- Yeni step yazmadan önce `features/step-definitions` ve `features/generated` aranmalıdır.

## Feature Dosyası Standardı

Feature dosyaları `features/generated` altında oluşturulur.

Örnek:

```gherkin
@smoke @auth
Feature: Authentication login

  Scenario: TC_001 - Kullanıcı geçerli bilgilerle login olur
    * Login ekranı açılır
    * Kullanıcı bilgileri ile giriş yapılır
    * Kullanıcının login olduğu doğrulanır
```

Kurallar:

- Scenario adı manuel test case ID ile başlamalıdır.
- Feature dosyasında locator, selector veya teknik Playwright detayı olmamalıdır.
- Beklenen sonuçlar business anlamlı adımlarla ifade edilmelidir.
- Test data mümkün olduğunca `src/data/data.ts` veya `.env` üzerinden gelmelidir.
- Feature adımları rapor okunabilirliğini desteklemelidir.

Örnek tag'ler:

```text
@smoke
@regression
@auth
@product
@basket
@checkout
```

## Runtime Değer Saklama - ScenarioStore

Test sırasında ekranda oluşan veya seçilen dinamik değerler `ScenarioStore` ile yönetilir.

Örnek runtime değerler:

- Dropdown'dan seçilen seçenek.
- Üretilen kayıt ID'si.
- Ekrandan okunan bir text veya attribute değeri.

Bu değerler statik test datası değildir ve `src/data/data.ts` içine yazılmaz.

API:

```ts
this.saveValue(name, value);
this.getValue<T = string>(name);
this.store.has(name);
```

Kurallar:

- Her scenario kendi boş store'u ile başlar.
- Bir senaryoda saklanan değer diğer senaryoya sızmaz.
- Step'lerde `saveValue` ve `getValue` tercih edilir.
- `saveValue` / `getValue` rapora SAVE / USE bilgisi yazar.
- Statik değer store'a konmaz.

Örnek kullanım:

```gherkin
* Para birimi dropdown'ından rastgele bir seçenek seçilir ve "option-1" olarak kaydedilir
* "option-1" olarak kaydedilen değer ile kayıt aranır
```

## Cucumber Support ve Login Session

`features/support` altında World, hooks, browser/page lifecycle ve reporting yapıları tutulur.

Kurallar:

- Browser, context ve page lifecycle Cucumber hook'ları ile yönetilir.
- Login gerektiren çok sayıda test varsa storage state kullanılabilir.
- Login testleri ayrı yazılmalıdır.
- `.auth/user.json` gibi session dosyaları git'e commit edilmemelidir.
- `.auth/` klasörü `.gitignore` içinde olmalıdır.

## Config ve Environment

Ortam bilgileri `src/config/env.ts` üzerinden yönetilir.

Kurallar:

- Uygulama URL'i `BASE_URL` environment variable üzerinden alınır.
- URL test dosyalarına hard-coded yazılmaz.
- Örnek env değerleri `.env.example` içinde tutulur.
- Gerçek `.env` lokal dosyadır ve commit edilmez.
- `dotenv/config` import'u entry point veya config seviyesinde tutulur.

Örnek:

```env
BASE_URL=
RUNNING_ENV=test
BROWSER=chromium
HEADED=false
USER1_USERNAME=
USER1_PASSWORD=
```

## Wait Kullanımı

Sabit bekleme kullanılmaz.

Kaçınılacak kullanım:

```ts
await page.waitForTimeout(3000);
```

Tercih edilen kullanım:

```ts
await expect(locator).toBeVisible();
await expect(page).toHaveURL(/basket|sepet/);
await locator.click();
await locator.fill('test');
```

Kurallar:

- Playwright auto-wait ve web-first assertion mekanizması kullanılmalıdır.
- Gerekirse belirli state beklenmelidir.
- Manuel bekleme sadece zorunlu ve gerekçeli durumlarda değerlendirilir.

## AI Destekli Test Üretim Standardı

Codex veya benzeri AI araçları yeni test üretirken aşağıdaki sırayı izlemelidir:

1. Manuel test case okunur.
2. Test case ID, title, steps ve expected result analiz edilir.
3. `INVENTORY.md` ve `rg` ile reuse araması yapılır.
4. Mevcut flow varsa kullanılır.
5. Sidebar navigasyon gerekiyorsa genel navigation step'i kullanılır.
6. Dropdown/listbox seçenek doğrulaması gerekiyorsa generic step + Data Table kullanılır.
7. Yeni locator gerekiyorsa Playwright MCP ile gerçek sayfada doğrulanır.
8. Eksik reusable parça varsa doğru katmana küçük ekleme yapılır.
9. Feature dosyası `features/generated` altında business seviyesinde oluşturulur.
10. Step definition mümkünse flow çağırır.
11. `npm run inventory` çalıştırılır.
12. `npm run check` çalıştırılır.
13. İlgili scenario veya feature çalıştırılır.
14. Hata varsa minimum değişiklikle düzeltilir.
15. Doğrulanamayan locator, anlamsız assertion veya TODO bırakılmaz.

AI araçları şunları yapmamalıdır:

- Her test için yeni Page Object class oluşturmak.
- Mevcut step/locator/action/assertion varken aynı iş için yenisini üretmek.
- Sidebar navigasyon için sayfa bazlı özel step yazmak.
- Dropdown seçenek doğrulaması için sayfa bazlı özel step/assertion yazmak.
- `waitForTimeout` kullanmak.
- Hayali data, locator veya assertion yazmak.
- TODO, placeholder step veya boş assertion bırakmak.
- Runtime değeri `data.ts` içine yazmak.

## Engel ve Geri Alma Kuralı

Yeni test veya ilgili ekleme aşağıdaki durumlarda koda bırakılmaz:

- Zorunlu locator gerçek sitede doğrulanamıyorsa.
- Expected Result için anlamlı assertion yazılamıyorsa.
- Ekran yetki, data, environment veya uygulama hatası nedeniyle açılamıyorsa.
- Manuel test aksiyonu uygulamada mantıklı karşılık bulmuyorsa.
- Testi geçirmek için fake selector veya gereksiz hard-code gerekiyorsa.

Engel durumunda:

1. O turda yapılan yeni feature, step, flow, action, assertion, locator ve data değişiklikleri geri alınır.
2. Kullanıcıya veya önceki branch çalışmasına ait değişiklikler geri alınmaz.
3. Kodda TODO, placeholder step, boş assertion veya geçici locator bırakılmaz.
4. Engel net şekilde raporlanır.

Rapor formatı:

```text
Bu test kodda bırakılmadı.
Sebep: [doğrulanamayan locator / eksik yetki / beklenen sonuç belirsiz / ekran açılmıyor]
Denendi: [login sonrası izlenen ekran yolu veya aksiyon]
Gereken düzeltme: [doğru locator / yetki / test data / ekran yolu / beklenen sonuç / uygulama fix'i]
Geri alınanlar: [bu turda oluşturulan dosya veya değişiklik özeti]
```

## Ortak Prompt Kullanımı

Yeni test üretiminde tek standart prompt dosyası kullanılmalıdır:

```text
docs/prompt-template.md
```

Kullanım:

```text
docs/prompt-template.md dosyasındaki promptu uygula.
```

Kurallar:

- `DOLDUR` alanı ilgili test için doldurulur.
- Boş alan bırakılmaz, bilinmeyen alanlara `yok` yazılır.
- Senaryo kararından emin olunmuyorsa `Senaryo işlemi` alanına `repo yapısından karar ver` yazılır.
- Kurallar prompt içine tekrar kopyalanmaz; ana kaynak `AGENTS.md`, reuse sözlüğü `INVENTORY.md` dosyasıdır.

## Manuel Test Case Formatı

Codex'e verilecek manuel test case mümkünse aşağıdaki formatta olmalıdır:

```text
Test Case ID:
TC_001

Başlık:
Kullanıcı geçerli bilgilerle login olur

URL:
/

Precondition:
- Kullanıcı login sayfasına erişebilir.
- Geçerli kullanıcı bilgisi vardır.

Test Data:
- user: USER1

Steps:
1. Login sayfasına git.
2. Kullanıcı adı alanına geçerli kullanıcı adı gir.
3. Şifre alanına geçerli şifre gir.
4. Giriş Yap butonuna tıkla.

Expected Result:
- Kullanıcı başarılı şekilde login olur.
- Hesap menüsü görünür.
- URL ana sayfa veya hesap sayfasına yönlenir.

Tags:
@smoke @auth
```

Expected Result belirsiz bırakılmamalıdır. "İşlem başarılı olur" gibi genel ifadeler yerine, neyin doğrulanacağı açık yazılmalıdır.

## Kalite Kapıları

Lokal kalite komutları:

```powershell
npm run inventory
npm run check
```

Test komutları:

```powershell
npm test
npm run test:chromium
npm run test:firefox
npm run test:webkit
npm run test:headed
npm run test:debug
```

PowerShell execution policy `npm.ps1` çalışmasını engellerse:

```powershell
npm.cmd run check
```

## Raporlama ve İzlenebilirlik

Reusable action ve assertion fonksiyonları Cucumber raporuna detay yazar.

Raporlanan bilgiler:

- Action veya assertion adı.
- Locator name.
- Locator value.
- Girilen değer veya beklenen sonuç.
- Hata durumunda kısaltılmış hata mesajı.
- Başarısız senaryoda screenshot.

Örnek rapor satırları:

```text
ACTION   Fill          Locator Name: auth.passwordInput   Locator Value: #password   -> ********
ASSERT   To Be Visible Locator Name: automaticParameters.listTitle   -> visible
```

Çıktı dosyaları:

| Dosya | Amaç |
| --- | --- |
| `cucumber-report.html` | İnsan tarafından okunabilir HTML rapor |
| `cucumber-report.json` | Entegrasyon ve işleme için JSON rapor |

## CI Standardı

GitHub Actions iş akışı `.github/workflows/cucumber.yml` altında tutulur.

CI akışı:

1. Repo checkout edilir.
2. Node.js kurulur.
3. `npm ci` ile bağımlılıklar yüklenir.
4. `npm run check` çalışır.
5. Playwright tarayıcıları kurulur.
6. `npm test` ile Cucumber senaryoları koşulur.
7. Cucumber raporları artifact olarak saklanır.

CI için gerekli koşullar:

| Gereksinim | Açıklama |
| --- | --- |
| `BASE_URL` | Test edilecek uygulama URL bilgisi |
| `USER1_USERNAME` / `USER1_PASSWORD` | Login gerektiren testler için kullanıcı bilgisi |
| Ortam erişimi | CI runner uygulama ortamını görebilmelidir |
| Sertifika / network erişimi | Kurumsal ağ, VPN veya sertifika ihtiyacı varsa runner seviyesinde çözülmelidir |

Not: Bu env/secrets tanımlı değilse `npm run check` çalışabilir, fakat UI test koşusu login veya ortam erişimi nedeniyle başarısız olabilir.

## Definition of Done

Bir otomasyon değişikliği tamamlanmış sayılmak için aşağıdaki şartları sağlamalıdır:

| Kontrol | Beklenti |
| --- | --- |
| Feature | `features/generated` altında, business dilinde ve `*` adımlarıyla yazılmış |
| Scenario | Manuel test case ID ile başlıyor |
| Step | Duplicate olmayan, Türkçe ve reusable step metni kullanılmış |
| Locator | Gerçek uygulamada doğrulanmış ve `LOCATOR_REPORTS` ile eklenmiş |
| Action | Sadece kullanıcı aksiyonu içeriyor |
| Assertion | Playwright web-first assertion kullanıyor |
| Flow | Business anlamlı akışı yönetiyor |
| Data | Hassas veri feature veya koda yazılmamış |
| Runtime değer | `ScenarioStore` ile yönetilmiş |
| Inventory | Yeni parçalar eklendiyse `INVENTORY.md` güncellenmiş |
| Check | `npm run check` temiz geçmiş |
| Test | İlgili scenario veya feature çalıştırılmış ya da neden çalıştırılamadığı raporlanmış |
| Kod temizliği | TODO, placeholder, geçici locator veya boş step yok |

## Review Checklist

PR veya test üretimi sonrası şu sorular kontrol edilmelidir:

1. Test adı TC ID ile başlıyor mu?
2. Feature dosyası `features/generated` altında mı?
3. Feature dosyasında teknik locator veya Playwright detayı var mı?
4. Step keyword olarak sadece `*` kullanılmış mı?
5. Aynı anlama gelen duplicate step üretilmiş mi?
6. Yeni step yazmadan önce `INVENTORY.md` ve `rg` ile arama yapılmış mı?
7. Yeni locator gerçek uygulamada doğrulanmış mı?
8. `LOCATOR_REPORTS` metadata bilgisi eklendi mi?
9. Sidebar navigasyon için genel navigation step kullanılmış mı?
10. Dropdown seçenek doğrulaması generic step + Data Table ile yapılmış mı?
11. Beklenen seçenek listesi koda gömülmemiş mi?
12. Action ve assertion katmanları karıştırılmış mı?
13. Hassas data feature veya koda yazılmış mı?
14. Runtime değer `ScenarioStore` ile mi taşınmış?
15. `waitForTimeout` var mı?
16. TODO, placeholder, geçici locator veya boş assertion var mı?
17. `npm run inventory` gerekiyorsa çalıştırılmış mı?
18. `npm run check` temiz mi?
19. İlgili test çalıştırılmış mı?
20. Doğrulanamayan parça varsa değişiklikler geri alınıp engel raporlanmış mı?

## Roller ve Sorumluluklar

| Rol | Sorumluluk |
| --- | --- |
| QA Automation | Otomasyon standardını uygular, feature/step/action/assertion kalitesini korur |
| QA Reviewer | Expected Result ile assertion uyumunu kontrol eder |
| Geliştirici | UI değişikliklerinin locator ve test stabilitesine etkisini bildirir |
| Teknik Lider | Mimari değişiklik, dependency ekleme ve büyük refactor kararlarını değerlendirir |
| AI Aracı | `AGENTS.md` ve `INVENTORY.md` doğrultusunda kurallı destek sağlar |

## Riskler ve Önlemler

| Risk | Etki | Önlem |
| --- | --- | --- |
| Ortam veya yetki eksikliği | Test login veya ekran erişiminde kalır | `.env`, kullanıcı yetkisi ve ortam erişimi koşu öncesi kontrol edilir |
| UI metni veya rol değişikliği | Locator kırılabilir | Locator raporları ve MCP doğrulaması ile hızlı analiz yapılır |
| Duplicate step/locator üretimi | Bakım maliyeti artar | `INVENTORY.md` ve `npm run check` kullanılır |
| Belirsiz expected result | Anlamsız assertion yazılabilir | Test koda bırakılmaz, beklenen sonuç netleştirilir |
| Flaky test davranışı | CI güvenilirliği azalır | `waitForTimeout` kullanılmaz, web-first assertion tercih edilir |
| Hassas verinin repoya sızması | Güvenlik riski oluşur | `.env` lokal tutulur, şifre raporda maskelenir |

## Karar Kayıtları

| Karar | Gerekçe |
| --- | --- |
| Klasik POM kullanılmaması | Başlangıçta hızlı test üretimi ve sade katman ayrımı hedeflenir |
| Data ve locator katmanlarının tek dosyada kalması | Mevcut hacim düşük, tek kaynak yönetimi daha kolay |
| Action/assertion katmanlarının domain bazlı ayrılması | Büyüme eşiği aşılmış ve bakım kolaylığı ihtiyacı oluşmuştur |
| Inventory mekanizması | Reuse aramasını ve duplicate kontrolünü mekanik hale getirir |
| Playwright MCP ile locator doğrulama | Tahmini selector riskini azaltır |
| TODO/placeholder yasağı | Kod tabanının çalışan ve güvenilir kalmasını sağlar |

## Mevcut Kapsam

| Feature | Kapsam |
| --- | --- |
| `TC_001_login.feature` | Geçerli kullanıcı ile login ve login sonrası doğrulama |
| `YTKP-1009.feature` | Otomatik Parametre Tanımlama ekranı ve ilgili kontroller |

YTKP-1009 kapsamındaki örnek kontroller:

- Sidebar menü yoluyla ekrana erişim.
- Seçili menü linki ve liste başlığı doğrulaması.
- Oluştur linkinin görünür ve aktif olması.
- Oluşturma ekranında bilgi başlığı ve URL doğrulaması.
- İşlem Kodu dropdown liste formatı ve count kontrolü.
- İşlem Kodu seçimine göre alanların aktif/pasif durumu.
- Fiş Açıklama maksimum uzunluk, Türkçe karakter ve zorunlu label kontrolü.
- Tür, Tür 2 ve KDV Oranı dropdown seçeneklerinin Data Table ile doğrulanması.

## Bakım Süreci

Bakım sırasında:

- Yeni test yazmadan önce `INVENTORY.md` okunur.
- Yeni locator eklenmeden önce uygulamada doğrulanır.
- Ortak elemanlar `common` veya `navigation` grubuna alınmadan önce gerçek reuse ihtiyacı kontrol edilir.
- Sayfaya özel locator veya assertion gereksiz şekilde common alana taşınmaz.
- Action ve assertion katmanları karıştırılmaz.
- PR öncesi `npm run check` çalıştırılır.
- Test raporu incelenir ve fail varsa rapordaki locator/action bilgisiyle analiz yapılır.

## Sonuç

Bu proje, manuel UI testlerini sürdürülebilir otomasyon varlıklarına dönüştürmek için ortak bir dil ve kontrollü bir mimari sunar. Cucumber senaryoları iş akışını okunur tutar, Playwright uygulama etkileşimlerini yürütür, TypeScript katmanları reuse'u yönetir, `INVENTORY.md` ve `npm run check` ise ekip genelinde standardı korur.

Detaylı geliştirme kuralları için ana kaynak `AGENTS.md` dosyasıdır. Bu Confluence dokümanı, proje paydaşları için kararların, süreçlerin ve kalite standartlarının okunabilir özetidir.
