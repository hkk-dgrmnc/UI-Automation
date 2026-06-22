# UI Automation Projesi - Confluence Dokümanı v1

## Sayfa Bilgisi

| Alan | Değer |
| --- | --- |
| Doküman adı | UI Automation Projesi |
| Versiyon | v1 |
| Durum | Aktif kullanım / bakımda |
| Sahip | QA Automation Ekibi |
| Hedef kitle | QA ekipleri, geliştiriciler, teknik liderler, proje paydaşları |
| Son güncelleme | 22 Haziran 2026 |
| Gözden geçirme periyodu | Her büyük mimari değişiklikte veya ayda bir |
| Ana kaynak | `AGENTS.md` |

> Not: Bu dosya Confluence'a taşınırken repo içi göreli bağlantılar, kurumun repo veya Confluence linkleriyle güncellenmelidir.

## İlgili Kaynaklar

| Kaynak | Amaç |
| --- | --- |
| [AGENTS.md](../AGENTS.md) | Kod üretim kuralları, mimari kararlar ve AI çalışma standardı |
| [README.md](../README.md) | Kurulum, çalıştırma ve geliştirici onboarding bilgisi |
| [INVENTORY.md](../INVENTORY.md) | Mevcut step, locator, action ve flow sözlüğü |
| [docs/prompt-template.md](./prompt-template.md) | Manuel test senaryolarını otomasyona çevirme prompt şablonu |
| [YTKP-1009-test-cases-codex.md](../YTKP-1009-test-cases-codex.md) | Örnek manuel test senaryosu dokümanı |

## Genel Bakış ve Yapılan Çalışmanın Özeti

Bu doküman, UI Automation projesinde kurulan Cucumber + Playwright + TypeScript otomasyon altyapısını, mimari kararları, yeniden kullanım standartlarını ve kalite kontrollerini ekipler arası görünür hale getirmek için hazırlanmıştır.

Çalışma kapsamında manuel test senaryolarının otomasyona dönüştürülmesini standartlaştıran bir yapı kurulmuştur. Testler; feature, step definition, flow, action, assertion, locator ve data katmanlarına ayrılmış, klasik Page Object Model yerine sade ve katmanlı bir mimari tercih edilmiştir.

Ayrıca locator ve step tekrarlarını azaltmak, AI destekli test üretimini kontrollü hale getirmek ve raporlanabilirliği artırmak için `INVENTORY.md`, `npm run check` ve `AGENTS.md` kuralları devreye alınmıştır. Bu sayfa; QA ekipleri, geliştiriciler, teknik liderler ve proje paydaşları için projenin ne yaptığını, neden gerekli olduğunu, nasıl kullanılacağını ve hangi kalite standartlarıyla sürdürüldüğünü özetleyen referans dokümandır.

## Amaç

Bu projenin amaçları şunlardır:

- Manuel test senaryolarını iş dilinde okunan Gherkin senaryolarına dönüştürmek.
- UI otomasyon testlerini stabil, bakımı kolay ve tekrar kullanılabilir hale getirmek.
- Locator, step, action, assertion ve flow tekrarını kontrol altında tutmak.
- Her aksiyon ve doğrulamayı Cucumber raporunda izlenebilir yapmak.
- AI destekli test üretimini kontrollü, denetlenebilir ve geri alınabilir hale getirmek.
- Proje büyüdükçe POM'a dönmeden domain bazlı katmanlaşmayla sürdürülebilir kalmak.

## Kapsam

Bu doküman ve proje aşağıdaki alanları kapsar:

- Web UI test otomasyonu.
- Cucumber feature dosyaları ve Gherkin step sözlüğü.
- Playwright ile browser otomasyonu.
- TypeScript tabanlı action, assertion, flow ve locator katmanları.
- Ortam bilgisi ve kullanıcı verisinin `.env` üzerinden yönetimi.
- Cucumber HTML/JSON raporları.
- Locator ve step tekrarını denetleyen inventory mekanizması.
- AI destekli test üretim kuralları.
- CI kalite kapısı ve test koşusu standardı.

## Kapsam Dışı

Aşağıdaki konular bu projenin mevcut kapsamında değildir:

- API test otomasyonu.
- Performans, yük, güvenlik veya erişilebilirlik testleri.
- Gauge runner, Gauge concept dosyaları veya `.cpt` yapısı.
- Klasik Page Object Model ve ekran bazlı `Page` sınıfları.
- Production ortamına ait kullanıcı bilgileri veya hassas verilerin repoda tutulması.
- Test verisinin uygulama tarafında otomatik oluşturulması.

## Çözülen Problem

| Problem | Projedeki Yaklaşım | Kazanım |
| --- | --- | --- |
| Aynı iş için farklı step veya locator isimleri üretilmesi | `INVENTORY.md` ve duplicate kontrolleri | Ortak otomasyon dili korunur |
| Tahmini veya kırılgan selector kullanımı | Locator'lar gerçek uygulamada Playwright MCP ile doğrulanır | UI değişikliklerinde hata kaynağı daha net bulunur |
| Test raporlarının teknik olmayan kişiler için anlamsız kalması | Her reusable action ve assertion rapora locator adı, locator değeri ve beklenen sonucu yazar | Hata analizi hızlanır |
| AI tarafından yarım veya tahmini kod üretilmesi | `AGENTS.md` kuralları, engelde geri alma ve TODO bırakmama standardı | Kod tabanı çalışan ve güvenilir kalır |
| Proje büyüdükçe POM veya dağınık dosya yapısına kayma riski | Katman bazlı mimari ve domain bazlı büyüme stratejisi | Bakım maliyeti kontrol altında kalır |

## Mimari Yaklaşım

Ana akış tek yönlüdür:

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
| Step Definition | `features/step-definitions/` | Gherkin adımını TypeScript akışıyla bağlar |
| Flow | `src/flows/` | Birden fazla action ve assertion içeren business akışlarını tutar |
| Action | `src/actions/` | Kullanıcı aksiyonlarını domain bazlı reusable fonksiyonlarla yönetir |
| Assertion | `src/assertions/` | Playwright web-first assertion'larını reusable hale getirir |
| Locator | `src/locators/locators.ts` | Element locator'larını ve rapor üst verisini tek kaynakta tutar |
| Data | `src/data/data.ts` | Statik test verisi ve `.env` kullanıcı okuma fonksiyonlarını tutar |
| Support | `features/support/` | World, hook, browser lifecycle, store ve raporlama bağlantısını yönetir |
| Config | `src/config/` | Ortam ve environment ayarlarını yönetir |

## Neden Klasik POM Kullanılmıyor?

Bu projede her ekran için `LoginPage`, `HomePage` veya `BasketPage` gibi sınıf dosyaları oluşturulmaz. Başlangıç hedefi, manuel test senaryolarını hızlı ve okunabilir şekilde otomasyona çevirmek; aynı zamanda kodu katmanlar üzerinden temiz tutmaktır.

POM yerine şu yaklaşım kullanılır:

- Locator'lar tek kaynakta tutulur.
- Kullanıcı aksiyonları action katmanında yer alır.
- Doğrulamalar assertion katmanında yer alır.
- Birden fazla adımdan oluşan iş akışları flow katmanına taşınır.
- Proje büyüdükçe POM'a dönülmez; gerekli katman ilgili domain'e göre bölünür.

Bu karar, hem hızlı başlangıç hem de uzun vadeli bakım hedefini birlikte destekler.

## Mevcut Klasör Yapısı

```text
features/
  generated/
  step-definitions/
  support/

src/
  actions/
  assertions/
  config/
  data/
  flows/
  locators/
  utils/

docs/
scripts/
```

Mevcut durumda `actions` ve `assertions` katmanları büyüme eşiğini aştığı için domain bazlı dosyalara ayrılmıştır. `data` ve `locators` katmanları henüz tek dosya olarak yönetilmektedir.

## Büyüme Stratejisi

Tek dosya modeli kalıcı bir hedef değildir. Bir katman yaklaşık 200-300 satırı aştığında veya aynı domain için tekrar eden çok sayıda parça oluştuğunda domain bazlı ayrım yapılır.

Kurallar:

- Ayrım sadece ihtiyaç olan katmanda yapılır.
- POM sınıfı oluşturulmaz.
- Mevcut test davranışı korunur.
- Aynı fonksiyon iki yerde bırakılmaz.
- Import değişiklikleri minimum tutulur.
- Gereksiz refactor yapılmaz.

Mevcut uygulama:

| Katman | Mevcut Durum |
| --- | --- |
| `src/actions/` | Domain bazlı ayrıldı: `common`, `auth`, `navigation`, `automaticParameters` |
| `src/assertions/` | Domain bazlı ayrıldı: `common`, `auth`, `automaticParameters` |
| `src/data/data.ts` | Tek dosya olarak korunuyor |
| `src/locators/locators.ts` | Tek dosya olarak korunuyor |

## Ortak Otomasyon Dili ve Yeniden Kullanım

Projenin ana prensibi, aynı işi yapan farklı step, locator, action veya assertion varyantları üretmemektir.

Yeni test yazmadan önce kontrol sırası:

1. `INVENTORY.md` içinde aynı step, locator, action veya flow aranır.
2. Gerekirse `rg` ile kod içinde derin arama yapılır.
3. Aynı business step varsa aynen kullanılır.
4. Aynı locator varsa mevcut locator kullanılır.
5. Aynı action, assertion veya flow varsa tekrar yazılmaz.
6. Ortak UI davranışı ise `common` veya `navigation` grubuna alınır.
7. Sadece ilgili domain'e aitse ilgili domain dosyasına eklenir.

Ortak mekanizmalar:

| İhtiyaç | Kullanılacak Standart |
| --- | --- |
| Sidebar menüden ekrana gitme | `"{string} menü yolundan sayfaya gidilir"` |
| Dropdown seçeneklerini doğrulama | `"{string} listesinde aşağıdaki seçenekler listelenir"` + Data Table |
| Login akışı | Mevcut auth flow ve auth step'leri |
| Dinamik değer saklama | `CustomWorld.store` ve `saveValue/getValue` |

## Locator Yönetimi

Locator'lar `src/locators/locators.ts` içinde tutulur. Her locator için rapor üst verisi `LOCATOR_REPORTS` içinde aynı grup ve anahtar yapısıyla bulunur.

Tercih sırası:

1. `getByTestId`
2. `getByRole`
3. `getByLabel`
4. `getByPlaceholder`
5. `getByText`
6. CSS locator
7. XPath, sadece zorunluysa

Temel kurallar:

- Hayali veya tahmini locator yazılmaz.
- Yeni locator gerçek uygulamada Playwright MCP ile doğrulanır.
- Selector ve UI metinleri `SELECTORS` / `TEXTS` sabitleriyle tek kaynakta tutulur.
- Locator eklendiğinde `LOCATOR_REPORTS` da eklenir.
- `npm run check`, locator rapor adları ve duplicate selector kontrollerini çalıştırır.

## Veri ve Gizli Bilgi Yönetimi

Kullanıcı bilgileri feature dosyalarına veya koda yazılmaz. Kullanıcı seçimi `"USER1"` gibi blok anahtarıyla yapılır.

Örnek `.env` yapısı:

```env
BASE_URL="https://example.test/shell-app-ui/#/journal-audits"
RUNNING_ENV=test
BROWSER=chromium
HEADED=false

USER1_USERNAME=
USER1_PASSWORD=
```

Kurallar:

- Gerçek kullanıcı adı ve şifre commit edilmez.
- `.env` lokal dosyadır ve `.gitignore` kapsamına girer.
- Statik test verisi `src/data/data.ts` içinde tutulur.
- Test sırasında oluşan runtime değerler `ScenarioStore` ile tutulur.
- Hassas değerler raporlarda maskelenir.

## AI Destekli Test Üretimi

Proje, Codex veya Claude gibi AI araçlarıyla test üretimine uygundur; ancak bu araçların serbest biçimde kod üretmesi hedeflenmez. AI aracı, `AGENTS.md` kurallarına bağlı çalışır.

AI için temel prensipler:

- Önce mevcut sözlük ve reusable parçalar aranır.
- Yeni locator yazmadan önce gerçek uygulamada doğrulama yapılır.
- Büyük refactor, dependency ekleme veya mimari değişiklik için önce plan sunulur.
- TODO, placeholder step veya geçici locator bırakılmaz.
- Expected result belirsizse test koda bırakılmaz.
- Engel varsa o turda yapılan test değişiklikleri geri alınır ve net engel raporu yazılır.

Engel raporu formatına örnek:

```text
Bu test kodda bırakılmadı.
Sebep: [doğrulanamayan locator / eksik yetki / beklenen sonuç belirsiz]
Denendi: [login sonrası izlenen ekran yolu veya aksiyon]
Gereken düzeltme: [doğru locator / yetki / test verisi / beklenen sonuç]
Geri alınanlar: [bu turda oluşturulan dosya veya değişiklik özeti]
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

## Kalite Kapıları

Lokal kalite komutları:

```powershell
npm run inventory
npm run check
```

`npm run check` aşağıdaki kontrolleri çalıştırır:

| Kontrol | Komut / Mekanizma |
| --- | --- |
| TypeScript derleme kontrolü | `tsc --noEmit` |
| Duplicate locator value kontrolü | `scripts/check-inventory.ts` |
| Locator report name/path uyumu | `scripts/check-inventory.ts` |
| Duplicate step metni kontrolü | `scripts/check-inventory.ts` |
| `INVENTORY.md` güncellik kontrolü | `npm run inventory:check` |

Yeni step, locator, action veya flow eklendiğinde `npm run inventory` çalıştırılır ve güncellenen `INVENTORY.md` değişikliğe dahil edilir.

## CI Standardı

GitHub Actions iş akışı `.github/workflows/cucumber.yml` altındadır.

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

## Kurulum ve Çalıştırma

Geliştirici makinesi için temel kurulum:

```powershell
npm install
Copy-Item .env.example .env
```

Test çalıştırma:

```powershell
npm test
npm run test:chromium
npm run test:firefox
npm run test:webkit
npm run test:headed
npm run test:debug
```

Kalite kontrol:

```powershell
npm run inventory
npm run check
```

PowerShell execution policy `npm.ps1` çalışmasını engellerse:

```powershell
npm.cmd run check
```

## Yeni Test Ekleme Süreci

1. Manuel test case okunur.
2. Test ID, başlık, action, data ve expected result netleştirilir.
3. `INVENTORY.md` üzerinden yeniden kullanım araması yapılır.
4. Gerekirse `rg` ile step, locator, action, assertion ve flow aranır.
5. Yeni locator gerekiyorsa Playwright MCP ile gerçek uygulamada doğrulanır.
6. Feature dosyası `features/generated/` altında iş dilinde yazılır.
7. Step definition teknik detay içermeden ilgili flow veya action'a bağlanır.
8. Gerekli action, assertion, locator veya data eklemeleri doğru katmana yapılır.
9. Yeni locator için `LOCATOR_REPORTS` güncellenir.
10. `npm run inventory` çalıştırılır.
11. `npm run check` çalıştırılır.
12. İlgili scenario veya feature koşulur.
13. Test çalışmıyorsa minimum değişiklikle düzeltilir.
14. Locator veya expected result doğrulanamıyorsa değişiklikler geri alınır ve engel raporlanır.

## Definition of Done

Bir otomasyon değişikliği tamamlanmış sayılmak için aşağıdaki koşulları sağlamalıdır:

| Kontrol | Beklenti |
| --- | --- |
| Feature | İş dilinde, `features/generated/` altında ve `*` adımlarıyla yazılmış |
| Step | Duplicate olmayan, Türkçe ve reusable step metni kullanılmış |
| Locator | Gerçek uygulamada doğrulanmış ve `LOCATOR_REPORTS` ile eklenmiş |
| Action | Sadece kullanıcı aksiyonu içeriyor, assertion içermiyor |
| Assertion | Playwright web-first assertion kullanıyor, action içermiyor |
| Raporlama | Reusable action/assertion rapora anlamlı bilgi yazıyor |
| Data | Hassas veri feature veya koda yazılmamış |
| Inventory | Yeni parçalar eklendiyse `INVENTORY.md` güncellenmiş |
| Check | `npm run check` temiz geçmiş |
| Test koşusu | İlgili scenario/feature çalıştırılmış veya neden çalıştırılamadığı raporlanmış |
| Kod temizliği | TODO, placeholder, geçici locator veya boş step yok |

## Roller ve Sorumluluklar

| Rol | Sorumluluk |
| --- | --- |
| QA Automation | Test otomasyon standardını uygular, feature/step/action/assertion kalitesini korur |
| QA Reviewer | Manuel expected result ile otomasyon assertion'larının uyumunu kontrol eder |
| Geliştirici | UI değişikliğinin locator ve test stabilitesine etkisini bildirir |
| Teknik Lider | Mimari değişiklik, dependency ekleme ve büyük refactor kararlarını değerlendirir |
| AI Aracı | Sadece `AGENTS.md` kuralları ve mevcut sözlük doğrultusunda yardımcı kod üretir |

## Riskler ve Önlemler

| Risk | Etki | Önlem |
| --- | --- | --- |
| Ortam veya yetki eksikliği | Testler login veya ekran erişiminde kalır | `.env`, kullanıcı yetkisi ve ortam erişimi koşu öncesi kontrol edilir |
| UI metni veya rol değişikliği | Locator kırılabilir | Locator raporları ve MCP doğrulaması ile hızlı tespit edilir |
| Duplicate step/locator üretimi | Bakım maliyeti artar | `INVENTORY.md` ve `npm run check` kullanılır |
| Belirsiz expected result | Anlamsız assertion yazılabilir | Test koda bırakılmaz, beklenen sonuç netleştirilir |
| Flaky test davranışı | CI güvenilirliği azalır | `waitForTimeout` kullanılmaz, web-first assertion tercih edilir |
| Hassas verinin repoya sızması | Güvenlik riski oluşur | `.env` lokal tutulur, şifre raporda maskelenir |

## Bakım ve Gözden Geçirme Süreci

Bakım sırasında dikkat edilecek noktalar:

- Yeni test yazmadan önce `INVENTORY.md` okunur.
- Yeni locator eklenmeden önce uygulamada doğrulanır.
- Ortak elemanlar `common` veya `navigation` gruplarına alınmadan önce gerçek yeniden kullanım ihtiyacı kontrol edilir.
- Sayfaya özel locator veya assertion gereksiz şekilde common alana taşınmaz.
- Action ve assertion katmanları karıştırılmaz.
- `npm run check` PR öncesi çalıştırılır.
- Test raporu incelenir ve fail varsa rapordaki locator/action bilgisiyle analiz yapılır.

Gözden geçirme soruları:

1. Bu step daha önce var mı?
2. Bu locator daha önce tanımlı mı?
3. Assertion expected result'ı gerçekten doğruluyor mu?
4. Test data veya hassas bilgi feature'a yazılmış mı?
5. Yeni parça doğru katmana mı eklendi?
6. Locator gerçek uygulamada doğrulandı mı?
7. Inventory güncel mi?
8. `npm run check` temiz mi?

## Mevcut Kapsam

| Feature | Kapsam |
| --- | --- |
| `TC_001_login.feature` | Geçerli kullanıcı ile login, login sonrası URL ve profil butonu doğrulaması |
| `YTKP-1009.feature` | Otomatik Parametre Tanımlama ekranına erişim ve oluşturma ekranına geçiş |

YTKP-1009 içinde kapsanan kontroller:

- Sidebar menü yoluyla ekrana erişim.
- Seçili menü linki ve liste başlığı doğrulaması.
- Oluştur linkinin varlığı ve aktifliği.
- Oluşturma ekranında bilgi başlığı ve URL doğrulaması.
- İşlem Kodu dropdown liste formatı ve count kontrolü.
- İşlem Kodu seçimine göre Tür 2 ve KDV Oranı alanlarının aktif/pasif durumları.
- Fiş Açıklama maksimum uzunluk ve Türkçe karakter kontrolü.
- Fiş Açıklama zorunlu alan label kontrolü.
- Tür, Tür 2 ve KDV Oranı dropdown seçeneklerinin Data Table ile doğrulanması.

## Teknoloji Yığını

| Alan | Teknoloji |
| --- | --- |
| Dil | TypeScript |
| Browser otomasyonu | Playwright |
| Test runner | Cucumber |
| Senaryo dili | Gherkin |
| Runtime TS desteği | ts-node |
| Env yönetimi | dotenv |
| Raporlama | Cucumber HTML/JSON ve özel console formatter |
| CI | GitHub Actions |
| Locator doğrulama | Playwright MCP |

## Karar Kayıtları

| Karar | Gerekçe |
| --- | --- |
| Klasik POM kullanılmaması | Başlangıçta hızlı test üretimi ve sade katman ayrımı hedeflenir |
| Locator'ların tek dosyada tutulması | Mevcut hacim düşük, tek kaynak yönetimi daha kolay |
| Action/assertion katmanlarının domain bazlı ayrılması | Büyüme eşiği aşılmış ve bakım kolaylığı ihtiyacı oluşmuştur |
| Inventory mekanizması | Reuse aramasını ve duplicate kontrolünü mekanik hale getirir |
| Playwright MCP ile locator doğrulama | Tahmini selector riskini azaltır |
| TODO/placeholder yasağı | Kod tabanının her zaman çalışan ve okunabilir kalmasını sağlar |

## Sonuç

UI Automation projesi, manuel UI testlerini sürdürülebilir otomasyon varlıklarına dönüştürmek için standart bir mimari ve ortak bir otomasyon dili sunar. Proje; Cucumber ile okunabilir senaryolar, Playwright ile güvenilir browser otomasyonu, TypeScript ile tip güvenliği, inventory mekanizmasıyla yeniden kullanım kontrolü ve raporlama altyapısıyla izlenebilirlik sağlar.

Detaylı geliştirme kuralları için ana kaynak `AGENTS.md` dosyasıdır. Bu Confluence dokümanı, proje paydaşları için kararların, sürecin ve kalite standartlarının özetlenmiş referansıdır.
