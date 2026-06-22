# UI Automation Projesi - Confluence Dokumani v1

## Sayfa Bilgisi

| Alan | Deger |
| --- | --- |
| Dokuman adi | UI Automation Projesi |
| Versiyon | v1 |
| Durum | Aktif kullanim / bakimda |
| Sahip | QA Automation Ekibi |
| Hedef kitle | QA ekipleri, developer'lar, teknik liderler, proje paydaslari |
| Son guncelleme | 22 Haziran 2026 |
| Review periyodu | Her major mimari degisiklikte veya ayda bir |
| Ana kaynak | `AGENTS.md` |

> Not: Bu dosya Confluence'a tasinirken repo ici relative linkler, kurumun repo veya Confluence linkleriyle guncellenmelidir.

## Ilgili Kaynaklar

| Kaynak | Amac |
| --- | --- |
| [AGENTS.md](../AGENTS.md) | Kod uretim kurallari, mimari kararlar ve AI calisma standardi |
| [README.md](../README.md) | Kurulum, calistirma ve gelistirici onboarding bilgisi |
| [INVENTORY.md](../INVENTORY.md) | Mevcut step, locator, action ve flow sozlugu |
| [docs/prompt-template.md](./prompt-template.md) | Manuel test case otomasyonuna cevirme prompt sablonu |
| [YTKP-1009-test-cases-codex.md](../YTKP-1009-test-cases-codex.md) | Ornek manuel test case dokumani |

## Yonetici Ozeti

UI Automation projesi, manuel UI test senaryolarini Cucumber + Playwright + TypeScript ile okunabilir, tekrar kullanilabilir ve raporlanabilir otomasyon testlerine donusturmek icin kurulmustur. Projenin temel hedefi, farkli ekip uyelerinin ve AI destekli araclarin ayni otomasyon diliyle, ayni mimari kurallara bagli kalarak test uretmesini saglamaktir.

Bu projede klasik Page Object Model kullanilmaz. Bunun yerine testler; feature, step definition, flow, action, assertion, locator ve data katmanlarina ayrilir. Reuse ve kalite standartlari yalnizca dokumantasyonla degil, `npm run check` ve `INVENTORY.md` gibi mekanik kontrollerle de korunur.

## Amac

Bu projenin amaclari sunlardir:

- Manuel test case'leri is dilinde okunan Gherkin senaryolarina donusturmek.
- UI otomasyon testlerini stabil, bakimi kolay ve tekrar kullanilabilir hale getirmek.
- Locator, step, action, assertion ve flow tekrarini kontrol altinda tutmak.
- Her aksiyon ve dogrulamayi Cucumber raporunda izlenebilir yapmak.
- AI destekli test uretimini kontrollu, denetlenebilir ve geri alinabilir hale getirmek.
- Proje buyudukce POM'a donmeden domain bazli katmanlasmayla surdurulebilir kalmak.

## Kapsam

Bu dokuman ve proje asagidaki alanlari kapsar:

- Web UI test otomasyonu.
- Cucumber feature dosyalari ve Gherkin step sozlugu.
- Playwright ile browser otomasyonu.
- TypeScript tabanli action, assertion, flow ve locator katmanlari.
- Ortam bilgisi ve kullanici verisinin `.env` uzerinden yonetimi.
- Cucumber HTML/JSON raporlari.
- Locator ve step tekrarini denetleyen inventory mekanizmasi.
- AI destekli test uretim kurallari.
- CI kalite kapisi ve test kosusu standardi.

## Kapsam Disi

Asagidaki konular bu projenin mevcut kapsaminda degildir:

- API test otomasyonu.
- Performans, yuk, guvenlik veya erisilebilirlik testleri.
- Gauge runner, Gauge concept dosyalari veya `.cpt` yapisi.
- Klasik Page Object Model ve ekran bazli `Page` class'lari.
- Production kullanici bilgileri veya hassas verilerin repoda tutulmasi.
- Test datasinin uygulama tarafinda otomatik provision edilmesi.

## Cozulen Problem

| Problem | Projedeki Yaklasim | Kazanim |
| --- | --- | --- |
| Ayni is icin farkli step veya locator isimleri uretilmesi | `INVENTORY.md` ve duplicate kontrolleri | Ortak otomasyon dili korunur |
| Tahmini veya kirilgan selector kullanimi | Locator'lar gercek uygulamada Playwright MCP ile dogrulanir | UI degisikliklerinde hata kaynagi daha net bulunur |
| Test raporlarinin teknik olmayan kisiler icin anlamsiz kalmasi | Her reusable action ve assertion rapora locator adi, locator degeri ve beklenen sonuc yazar | Hata analizi hizlanir |
| AI tarafindan yarim veya tahmini kod uretilmesi | `AGENTS.md` kurallari, engelde geri alma ve TODO birakmama standardi | Kod tabani calisan ve guvenilir kalir |
| Proje buyudukce POM veya daginik dosya yapisina kayma riski | Katman bazli mimari ve domain bazli buyume stratejisi | Bakim maliyeti kontrol altinda kalir |

## Mimari Yaklasim

Ana akis tek yonludur:

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

Katman sorumluluklari:

| Katman | Konum | Sorumluluk |
| --- | --- | --- |
| Feature | `features/generated/` | Manuel test case'lerden uretilen, is dilinde okunan senaryolar |
| Step Definition | `features/step-definitions/` | Gherkin adimini TypeScript akisiyle baglar |
| Flow | `src/flows/` | Birden fazla action ve assertion iceren business akislarini tutar |
| Action | `src/actions/` | Kullanici aksiyonlarini domain bazli reusable fonksiyonlarla yonetir |
| Assertion | `src/assertions/` | Playwright web-first assertion'larini reusable hale getirir |
| Locator | `src/locators/locators.ts` | Element locator'larini ve rapor metadatasini tek kaynakta tutar |
| Data | `src/data/data.ts` | Statik test verisi ve `.env` kullanici okuma fonksiyonlarini tutar |
| Support | `features/support/` | World, hook, browser lifecycle, store ve raporlama baglantisini yonetir |
| Config | `src/config/` | Ortam ve environment ayarlarini yonetir |

## Neden Klasik POM Kullanilmiyor?

Bu projede her ekran icin `LoginPage`, `HomePage` veya `BasketPage` gibi class dosyalari olusturulmaz. Baslangic hedefi, manuel test case'leri hizli ve okunabilir sekilde otomasyona cevirmek; ayni zamanda kodu katmanlar uzerinden temiz tutmaktir.

POM yerine su yaklasim kullanilir:

- Locator'lar tek kaynakta tutulur.
- Kullanici aksiyonlari action katmaninda yer alir.
- Dogrulamalar assertion katmaninda yer alir.
- Birden fazla adimdan olusan is akislar flow katmanina tasinir.
- Proje buyudukce POM'a donulmaz; gerekli katman ilgili domain'e gore bolunur.

Bu karar, hem hizli baslangic hem de uzun vadeli bakim hedefini birlikte destekler.

## Mevcut Klasor Yapisi

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

Mevcut durumda `actions` ve `assertions` katmanlari buyume esigini astigi icin domain bazli dosyalara ayrilmistir. `data` ve `locators` katmanlari henuz tek dosya olarak yonetilmektedir.

## Buyume Stratejisi

Tek dosya modeli kalici bir hedef degildir. Bir katman yaklasik 200-300 satiri astiginda veya ayni domain icin tekrar eden cok sayida parca olustugunda domain bazli ayrim yapilir.

Kurallar:

- Ayrim sadece ihtiyac olan katmanda yapilir.
- POM class'i olusturulmaz.
- Mevcut test davranisi korunur.
- Ayni fonksiyon iki yerde birakilmaz.
- Import degisiklikleri minimum tutulur.
- Gereksiz refactor yapilmaz.

Mevcut uygulama:

| Katman | Mevcut Durum |
| --- | --- |
| `src/actions/` | Domain bazli ayrildi: `common`, `auth`, `navigation`, `automaticParameters` |
| `src/assertions/` | Domain bazli ayrildi: `common`, `auth`, `automaticParameters` |
| `src/data/data.ts` | Tek dosya olarak korunuyor |
| `src/locators/locators.ts` | Tek dosya olarak korunuyor |

## Ortak Otomasyon Dili ve Yeniden Kullanim

Projenin ana prensibi, ayni isi yapan farkli step, locator, action veya assertion varyantlari uretmemektir.

Yeni test yazmadan once kontrol sirasi:

1. `INVENTORY.md` icinde ayni step, locator, action veya flow aranir.
2. Gerekirse `rg` ile kod icinde derin arama yapilir.
3. Ayni business step varsa aynen kullanilir.
4. Ayni locator varsa mevcut locator kullanilir.
5. Ayni action, assertion veya flow varsa tekrar yazilmaz.
6. Ortak UI davranisi ise `common` veya `navigation` grubuna alinir.
7. Sadece ilgili domain'e aitse ilgili domain dosyasina eklenir.

Ortak mekanizmalar:

| Ihtiyac | Kullanilacak Standart |
| --- | --- |
| Sidebar menuden ekrana gitme | `"{string} menü yolundan sayfaya gidilir"` |
| Dropdown seceneklerini dogrulama | `"{string} listesinde aşağıdaki seçenekler listelenir"` + Data Table |
| Login akisi | Mevcut auth flow ve auth step'leri |
| Dinamik deger saklama | `CustomWorld.store` ve `saveValue/getValue` |

## Locator Yonetimi

Locator'lar `src/locators/locators.ts` icinde tutulur. Her locator icin rapor metadatasi `LOCATOR_REPORTS` icinde ayni grup ve anahtar yapisiyla bulunur.

Tercih sirasi:

1. `getByTestId`
2. `getByRole`
3. `getByLabel`
4. `getByPlaceholder`
5. `getByText`
6. CSS locator
7. XPath, sadece zorunluysa

Temel kurallar:

- Hayali veya tahmini locator yazilmaz.
- Yeni locator gercek uygulamada Playwright MCP ile dogrulanir.
- Selector ve UI metinleri `SELECTORS` / `TEXTS` sabitleriyle tek kaynakta tutulur.
- Locator eklendiginde `LOCATOR_REPORTS` da eklenir.
- `npm run check`, locator rapor adlari ve duplicate selector kontrollerini calistirir.

## Data ve Sir Yonetimi

Kullanici bilgileri feature dosyalarina veya koda yazilmaz. Kullanici secimi `"USER1"` gibi blok anahtariyla yapilir.

Ornek `.env` yapisi:

```env
BASE_URL="https://example.test/shell-app-ui/#/journal-audits"
RUNNING_ENV=test
BROWSER=chromium
HEADED=false

USER1_USERNAME=
USER1_PASSWORD=
```

Kurallar:

- Gercek kullanici adi ve sifre commit edilmez.
- `.env` lokal dosyadir ve `.gitignore` kapsamina girer.
- Statik test datasi `src/data/data.ts` icinde tutulur.
- Test sirasinda olusan runtime degerler `ScenarioStore` ile tutulur.
- Hassas degerler raporlarda maskelenir.

## AI Destekli Test Uretimi

Proje, Codex veya Claude gibi AI araclariyla test uretimine uygundur; ancak AI'in serbest bicimde kod uretmesi hedeflenmez. AI, `AGENTS.md` kurallarina bagli calisir.

AI icin temel prensipler:

- Once mevcut sozluk ve reusable parcalar aranir.
- Yeni locator yazmadan once gercek uygulamada dogrulama yapilir.
- Buyuk refactor, dependency ekleme veya mimari degisiklik icin once plan sunulur.
- TODO, placeholder step veya gecici locator birakilmaz.
- Expected result belirsizse test koda birakilmaz.
- Engel varsa o turda yapilan test degisiklikleri geri alinir ve net engel raporu yazilir.

Engel raporu formatina ornek:

```text
Bu test kodda birakilmadi.
Sebep: [dogrulanamayan locator / eksik yetki / beklenen sonuc belirsiz]
Denendi: [login sonrasi izlenen ekran yolu veya aksiyon]
Gereken duzeltme: [dogru locator / yetki / test data / beklenen sonuc]
Geri alinanlar: [bu turda olusturulan dosya veya degisiklik ozeti]
```

## Raporlama ve Izlenebilirlik

Reusable action ve assertion fonksiyonlari Cucumber raporuna detay yazar.

Raporlanan bilgiler:

- Action veya assertion adi.
- Locator name.
- Locator value.
- Girilen deger veya beklenen sonuc.
- Hata durumunda kisaltilmis hata mesaji.
- Basarisiz senaryoda screenshot.

Ornek rapor satirlari:

```text
ACTION   Fill          Locator Name: auth.passwordInput   Locator Value: #password   -> ********
ASSERT   To Be Visible Locator Name: automaticParameters.listTitle   -> visible
```

Cikti dosyalari:

| Dosya | Amac |
| --- | --- |
| `cucumber-report.html` | Insan tarafindan okunabilir HTML rapor |
| `cucumber-report.json` | Entegrasyon ve isleme icin JSON rapor |

## Kalite Kapilari

Lokal kalite komutlari:

```powershell
npm run inventory
npm run check
```

`npm run check` asagidaki kontrolleri calistirir:

| Kontrol | Komut / Mekanizma |
| --- | --- |
| TypeScript derleme kontrolu | `tsc --noEmit` |
| Duplicate locator value kontrolu | `scripts/check-inventory.ts` |
| Locator report name/path uyumu | `scripts/check-inventory.ts` |
| Duplicate step metni kontrolu | `scripts/check-inventory.ts` |
| `INVENTORY.md` guncellik kontrolu | `npm run inventory:check` |

Yeni step, locator, action veya flow eklendiginde `npm run inventory` calistirilir ve guncellenen `INVENTORY.md` degisiklige dahil edilir.

## CI Standardi

GitHub Actions workflow'u `.github/workflows/cucumber.yml` altindadir.

CI akisi:

1. Repo checkout edilir.
2. Node.js kurulur.
3. `npm ci` ile bagimliliklar yuklenir.
4. `npm run check` calisir.
5. Playwright browser'lari kurulur.
6. `npm test` ile Cucumber senaryolari kosulur.
7. Cucumber raporlari artifact olarak saklanir.

CI icin gerekli kosullar:

| Gereksinim | Aciklama |
| --- | --- |
| `BASE_URL` | Test edilecek uygulama URL'i |
| `USER1_USERNAME` / `USER1_PASSWORD` | Login gerektiren testler icin kullanici bilgisi |
| Ortam erisimi | CI runner uygulama ortamini gorebilmelidir |
| Sertifika / network erisimi | Kurumsal ag, VPN veya sertifika ihtiyaci varsa runner seviyesinde cozulmelidir |

Not: Bu env/secrets tanimli degilse `npm run check` calisabilir, fakat UI test kosusu login veya ortam erisimi nedeniyle basarisiz olabilir.

## Kurulum ve Calistirma

Gelistirici makinesi icin temel kurulum:

```powershell
npm install
Copy-Item .env.example .env
```

Test calistirma:

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

PowerShell execution policy `npm.ps1` calismasini engellerse:

```powershell
npm.cmd run check
```

## Yeni Test Ekleme Sureci

1. Manuel test case okunur.
2. Test ID, baslik, action, data ve expected result netlestirilir.
3. `INVENTORY.md` uzerinden reuse aramasi yapilir.
4. Gerekirse `rg` ile step, locator, action, assertion ve flow aranir.
5. Yeni locator gerekiyorsa Playwright MCP ile gercek uygulamada dogrulanir.
6. Feature dosyasi `features/generated/` altinda business dilinde yazilir.
7. Step definition teknik detay icermeden ilgili flow veya action'a baglanir.
8. Gerekli action, assertion, locator veya data eklemeleri dogru katmana yapilir.
9. Yeni locator icin `LOCATOR_REPORTS` guncellenir.
10. `npm run inventory` calistirilir.
11. `npm run check` calistirilir.
12. Ilgili scenario veya feature kosulur.
13. Test calismiyorsa minimum degisiklikle duzeltilir.
14. Locator veya expected result dogrulanamiyorsa degisiklikler geri alinir ve engel raporlanir.

## Definition of Done

Bir otomasyon degisikligi tamamlanmis sayilmak icin asagidaki kosullari saglamalidir:

| Kontrol | Beklenti |
| --- | --- |
| Feature | Business dilinde, `features/generated/` altinda ve `*` adimlariyla yazilmis |
| Step | Duplicate olmayan, Turkce ve reusable step metni kullanilmis |
| Locator | Gercek uygulamada dogrulanmis ve `LOCATOR_REPORTS` ile eklenmis |
| Action | Sadece kullanici aksiyonu iceriyor, assertion icermiyor |
| Assertion | Playwright web-first assertion kullaniyor, action icermiyor |
| Raporlama | Reusable action/assertion rapora anlamli bilgi yaziyor |
| Data | Hassas veri feature veya koda yazilmamis |
| Inventory | Yeni parcalar eklendiyse `INVENTORY.md` guncellenmis |
| Check | `npm run check` temiz gecmis |
| Test kosusu | Ilgili scenario/feature calistirilmis veya neden calistirilamadigi raporlanmis |
| Kod temizligi | TODO, placeholder, gecici locator veya bos step yok |

## Roller ve Sorumluluklar

| Rol | Sorumluluk |
| --- | --- |
| QA Automation | Test otomasyon standardini uygular, feature/step/action/assertion kalitesini korur |
| QA Reviewer | Manuel expected result ile otomasyon assertion'larinin uyumunu kontrol eder |
| Developer | UI degisikliginin locator ve test stabilitesine etkisini bildirir |
| Teknik Lider | Mimari degisiklik, dependency ekleme ve buyuk refactor kararlarini degerlendirir |
| AI Araci | Sadece `AGENTS.md` kurallari ve mevcut sozluk dogrultusunda yardimci kod uretir |

## Riskler ve Onlemler

| Risk | Etki | Onlem |
| --- | --- | --- |
| Ortam veya yetki eksikligi | Testler login veya ekran erisiminde kalir | `.env`, kullanici yetkisi ve ortam erisimi kosu oncesi kontrol edilir |
| UI metni veya rol degisikligi | Locator kirilabilir | Locator raporlari ve MCP dogrulamasi ile hizli tespit edilir |
| Duplicate step/locator uretimi | Bakim maliyeti artar | `INVENTORY.md` ve `npm run check` kullanilir |
| Belirsiz expected result | Anlamsiz assertion yazilabilir | Test koda birakilmaz, beklenen sonuc netlestirilir |
| Flaky test davranisi | CI guvenilirligi azalir | `waitForTimeout` kullanilmaz, web-first assertion tercih edilir |
| Hassas verinin repoya sizmasi | Guvenlik riski olusur | `.env` lokal tutulur, sifre raporda maskelenir |

## Bakim ve Review Sureci

Bakim sirasinda dikkat edilecek noktalar:

- Yeni test yazmadan once `INVENTORY.md` okunur.
- Yeni locator eklenmeden once uygulamada dogrulanir.
- Ortak elemanlar `common` veya `navigation` gruplarina alinmadan once gercek reuse ihtiyaci kontrol edilir.
- Sayfaya ozel locator veya assertion gereksiz sekilde common alana tasinmaz.
- Action ve assertion katmanlari karistirilmaz.
- `npm run check` PR oncesi calistirilir.
- Test raporu incelenir ve fail varsa rapordaki locator/action bilgisiyle analiz yapilir.

Review sorulari:

1. Bu step daha once var mi?
2. Bu locator daha once tanimli mi?
3. Assertion expected result'i gercekten dogruluyor mu?
4. Test data veya hassas bilgi feature'a yazilmis mi?
5. Yeni parca dogru katmana mi eklendi?
6. Locator gercek uygulamada dogrulandi mi?
7. Inventory guncel mi?
8. `npm run check` temiz mi?

## Mevcut Kapsam

| Feature | Kapsam |
| --- | --- |
| `TC_001_login.feature` | Gecerli kullanici ile login, login sonrasi URL ve profil butonu dogrulamasi |
| `YTKP-1009.feature` | Otomatik Parametre Tanimlama ekranina erisim ve olusturma ekranina gecis |

YTKP-1009 icinde kapsanan kontroller:

- Sidebar menu yoluyla ekrana erisim.
- Secili menu linki ve liste basligi dogrulamasi.
- Olustur linkinin varligi ve aktifligi.
- Olusturma ekraninda bilgi basligi ve URL dogrulamasi.
- Islem Kodu dropdown liste format ve count kontrolu.
- Islem Kodu secimine gore Tur 2 ve KDV Orani alanlarinin aktif/pasif durumlari.
- Fis Aciklama maksimum uzunluk ve Turkce karakter kontrolu.
- Fis Aciklama zorunlu alan label kontrolu.
- Tur, Tur 2 ve KDV Orani dropdown seceneklerinin Data Table ile dogrulanmasi.

## Teknoloji Yigini

| Alan | Teknoloji |
| --- | --- |
| Dil | TypeScript |
| Browser otomasyonu | Playwright |
| Test runner | Cucumber |
| Senaryo dili | Gherkin |
| Runtime TS destegi | ts-node |
| Env yonetimi | dotenv |
| Raporlama | Cucumber HTML/JSON ve ozel console formatter |
| CI | GitHub Actions |
| Locator dogrulama | Playwright MCP |

## Karar Kayitlari

| Karar | Gerekce |
| --- | --- |
| Klasik POM kullanilmamasi | Baslangicta hizli test uretimi ve sade katman ayrimi hedeflenir |
| Locator'larin tek dosyada tutulmasi | Mevcut hacim dusuk, tek kaynak yonetimi daha kolay |
| Action/assertion katmanlarinin domain bazli ayrilmasi | Buyume esigi asilmis ve bakim kolayligi ihtiyaci olusmustur |
| Inventory mekanizmasi | Reuse aramasini ve duplicate kontrolunu mekanik hale getirir |
| Playwright MCP ile locator dogrulama | Tahmini selector riskini azaltir |
| TODO/placeholder yasagi | Kod tabaninin her zaman calisan ve okunabilir kalmasini saglar |

## Ozet

UI Automation projesi, manuel UI testlerini surdurulebilir otomasyon varliklarina donusturmek icin standart bir mimari ve ortak bir otomasyon dili sunar. Proje; Cucumber ile okunabilir senaryolar, Playwright ile guvenilir browser otomasyonu, TypeScript ile tip guvenligi, inventory mekanizmasiyla reuse kontrolu ve raporlama altyapisiyla izlenebilirlik saglar.

Detayli gelistirme kurallari icin ana kaynak `AGENTS.md` dosyasidir. Bu Confluence dokumani, proje paydaslari icin kararlarin, surecin ve kalite standartlarinin ozetlenmis referansidir.
