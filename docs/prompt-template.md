# Otomasyon Uretim Prompt Sablonu

Bu dosya, manuel test case'leri Cucumber + Playwright + TypeScript otomasyonuna
cevirmek icin kullanilacak tek standart prompt'tur.

Kullanim:

1. Sadece `DOLDUR` alanini ilgili test icin guncelle.
2. AI'a `docs/prompt-template.md dosyasindaki promptu uygula` demen yeterlidir.
3. Kurallari prompt icinde cogaltma; ana kaynak her zaman `AGENTS.md` ve
   mevcut reuse sozlugu `INVENTORY.md` dosyalaridir.

Dolduran kisi icin not:

- `DOLDUR` alaninda bos satir birakma.
- Bilinmeyen alanlara `yok` yaz.
- Senaryo kararindan emin degilsen `Senaryo islemi` alanina
  `repo yapisindan karar ver` yaz.

AI icin not: Bu ust kisim kullanim aciklamasidir. Uygulanacak asil prompt
`## Prompt` basligindan baslar.

---

## Prompt

Bu repo Cucumber + Playwright + TypeScript UI otomasyon projesidir.

Ana kural kaynagi `AGENTS.md` dosyasidir. Once `AGENTS.md` ve `INVENTORY.md`
dosyalarini oku. Mevcut step, locator, action, assertion veya flow varsa
yenisini yazma; mevcut reusable yapilari kullan.

### DOLDUR

```text
Manuel test dosyasi:
Bu turda otomasyona alinacak TC'ler:
Haric tutulacak TC'ler:
Senaryo islemi: [mevcut senaryoya devam et | mevcut feature icinde yeni scenario ac | yeni feature ac | repo yapisindan karar ver]
Kullanici:
Ek not: yok
```

### Calisma Sirasi

1. Manuel test case'i oku; action, data ve expected result alanlarini netlestir.
2. `INVENTORY.md` icinde mevcut step, locator, action, assertion ve flow reuse'u ara.
3. Gerekirse `rg` ile `src` ve `features` altinda derin arama yap.
4. Ana test ID, feature dosyasi, step dosyasi/domain ve baslangic ekrani manuel
   test dosyasi ile mevcut repo yapisindan cikarilmalidir.
5. `Senaryo islemi` alanina gore hareket et:
   - `mevcut senaryoya devam et`: mevcut feature ve mevcut scenario korunur,
     yeni TC adimlari mevcut senaryonun sonuna eklenir.
   - `mevcut feature icinde yeni scenario ac`: ilgili mevcut feature korunur,
     ayni feature icinde yeni scenario olusturulur.
   - `yeni feature ac`: test tipine gore `features/cases/smoke` veya
     `features/cases/regression` altinda yeni feature dosyasi olusturulur;
     gerekli scenario bu dosyada yazilir.
   - `repo yapisindan karar ver`: mevcut feature/senaryo yapisi ve manuel test
     akisi incelenir; emin olunamiyorsa tahminle kod yazmadan blokaj raporlanir.
6. Login gerekiyorsa mevcut auth step/flow'unu kullan; yeni login akisi yazma.
7. Sidebar menu gecisi gerekiyorsa mevcut genel navigation step'ini kullan:
   `"{string} menü yolundan sayfaya gidilir"`.
8. Dropdown/listbox islemlerinde once string parametreli mevcut common/generic
   step, action veya assertion'lari kullan. Secenek gorunurlugu icin:
   `"{string} listesinde aşağıdaki seçenekler listelenir"` + Data Table.
   Mevcut common/generic yapi ihtiyaci guvenli karsilamiyorsa ve gercek ekran
   dogrulamasi gerektiriyorsa en kucuk ozel domain action/assertion ekle.
9. Dropdown'dan secilen veya ekrandan okunan dinamik bir deger sonraki adimda
   kullanilacaksa `ScenarioStore` standardini uygula. Kaynak UI alani ve hedef
   kullanim baglami step metninde parametre olarak gorunmeli:
   `"{Dropdown Adi}" dropdown'ından rastgele bir seçenek seçilir ve "{degerAnahtari}" olarak kaydedilir`
   ve `"{degerAnahtari}" olarak kaydedilen değer "{Hedef Tablo/Liste/Alan}" ile kayıt aranır`.
   Degeri `this.saveValue` / `this.getValue` ile sakla/oku; `data.ts`'e veya
   feature'a hard-code etme.
10. Yeni locator gerekiyorsa Playwright MCP ile gercek uygulamada dogrula.
11. Dogrulanmayan locator, tahmini selector, TODO, placeholder step veya bos assertion
   koda birakma.
12. Feature dosyasi test tipine gore `features/cases/smoke` veya
   `features/cases/regression` altinda business dilinde olsun; step keyword
   olarak sadece `*` kullan.
13. Step definition teknik detay veya locator icermesin; mumkunse flow cagir.
14. Yeni action/assertion gerekiyorsa dogru domain dosyasina ekle; common primitive'leri
    tekrar yazma.
15. Yeni locator eklenirse `locators` ve `LOCATOR_REPORTS` birlikte guncellensin.
16. Yeni step, locator, action veya flow eklendiyse `npm run inventory` calistir.
17. Sonunda `npm.cmd run check` calistir.
18. Ilgili scenario veya feature'i calistir; hata varsa minimum degisiklikle duzelt.

### Cikti Beklentisi

- Kod `AGENTS.md` mimarisine uygun olmali.
- Klasik Page Object Model veya ekran bazli `Page` class'i olusturulmamali.
- Duplicate step, locator, action veya assertion uretilmemeli.
- Yeni locator gercek uygulamada dogrulanmis olmali.
- Hassas veri feature'a veya koda yazilmamali.
- `INVENTORY.md` gerekiyorsa guncellenmis olmali.
- `npm.cmd run check` temiz gecmeli.
- Ilgili test sonucu final cevapta raporlanmali.

### Blokaj Kurali

Locator, yetki, test data, ekran erisimi veya expected result dogrulanamiyorsa
bu turda yaptigin test degisikliklerini geri al. Kullaniciya veya onceki branch'e
ait degisikliklere dokunma. Kodda yarim is birakma.

Final cevabi su formatta ver:

```text
Bu test kodda birakilmadi.
Sebep:
Denendi:
Gereken duzeltme:
Geri alinanlar:
```

### Final Cevap Formati

Is tamamlandiysa final cevapta kisaca sunlari yaz:

```text
Tamamlandi:
Degisen dosyalar:
Calistirilan kontroller:
Test sonucu:
Notlar:
```
