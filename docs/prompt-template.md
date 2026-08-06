# Otomasyon Üretim Çalışma Sözleşmesi

Bu dosya, manuel test case'leri Cucumber + Playwright + TypeScript
otomasyonuna dönüştürmek için kullanılan değişmez çalışma sözleşmesidir.
Test veya ekip bazında düzenlenmez; göreve ait bilgiler sohbet mesajında verilir.

Kalıcı mimari ve kalite kurallarının ana kaynağı `AGENTS.md`, mevcut reusable
sözlüğün kaynağı `INVENTORY.md` dosyasıdır. Bu sözleşme o kuralları tekrar etmez.

## Kullanım

Aşağıdaki görev bloğunu kopyala, köşeli parantezli alanları doldur ve sohbete
gönder. `docs/prompt-template.md` dosyasını değiştirme.

```text
docs/prompt-template.md dosyasındaki promptu uygula.

Kaynak: [ repoda case adı veya yolu ]
TC kapsamı: [TC-ID listesi | TÜMÜ]
Yerleşim: [AUTO | MEVCUT SENARYOYA DEVAM | MEVCUT FEATURE'DA YENİ SENARYO | YENİ FEATURE]
Hedef feature: [AUTO | feature dosya yolu/adı | YOK | BİLİNMİYOR]
Hedef scenario: [AUTO | scenario adı | YOK | BİLİNMİYOR]
Kullanıcı profili: [USER anahtarı | YOK | BİLİNMİYOR]
Ortam profili: [mevcut .env | profil adı | YOK | BİLİNMİYOR]
Ek kabul kriterleri: [metin | YOK | BİLİNMİYOR]
Bilinmeyen bilgiler: [açık liste | YOK]
Çalışma modu: [NORMAL | orchestration mode aktif]
```

`metin:` kaynağı çok satırlıysa test case içeriği görev bloğunun hemen altına
ayrı bir kod bloğu olarak eklenir. Hassas bilgi, kullanıcı adı, şifre veya token
sohbete yazılmaz; yalnızca `.env` kullanıcı/profil anahtarı verilir.

### Kaynak biçimleri

- `repo:<göreli-yol>`: Workspace içindeki dosya. Varsayılan ve tercih edilen
  biçimdir.
- `ek:<dosya-adı>`: Sohbete eklenen dosya.
- `mcp:<sistem>/<kaynak-id>`: Kurulu ve erişilebilir MCP kaynağı.
- `metin:<içerik>`: Mesajda verilen test case metni.
- `url:<adres>`: Erişilebilir dış kaynak. Kimlik bilgisi URL'ye yazılmaz.

Her görevde tek authoritative kaynak belirtilir. Birden fazla kaynak gerekiyorsa
hangisinin authoritative olduğu `Ek kabul kriterleri` alanında açıklanır.

### Özel değerler

- `AUTO`: AI repo ve authoritative kaynak kanıtına göre karar verir. Yalnızca
  karar verilebilen alanlarda kullanılır.
- `YOK`: Alan bilinçli olarak uygulanmıyor veya ek bilgi bulunmuyor demektir.
- `BİLİNMİYOR`: Gerekli bilgi henüz bilinmiyor demektir. AI bilgiyi kaynakta,
  repoda veya gerçek UI'da güvenle bulabiliyorsa ilerler; bulamıyorsa tahmin
  etmez ve blokaj raporlar.

Alan boş bırakılmaz. `YOK`, bilinmeyen bir bilgiyi gizlemek için kullanılmaz.
Authoritative test case ID'si bilinmiyorsa ID üretilmez.

## AI Çalışma Sözleşmesi

1. İşleme başlamadan önce `AGENTS.md` ve `INVENTORY.md` dosyalarını baştan sona
   oku; görev bloğunu yalnızca bu tura ait kapsam ve parametreler olarak yorumla.
2. Yalnız `TC kapsamı` alanında yetkilendirilen testleri ele al. `TÜMÜ`, yalnızca
   kaynakta bulunan tüm test case'leri ifade eder.
3. `AUTO` kararlarını mevcut repo yapısı ve kaynak kanıtıyla ver. Çelişen veya
   doğrulanamayan gerekli bilgiyi uydurma.
4. Reuse, locator doğrulama, değişiklikleri koruma, kalite kapıları, canlı test
   ve engelde geri alma kurallarını `AGENTS.md` uyarınca uygula.
5. Bir kontrol çalıştırılamadıysa bunu `geçti` olarak raporlama. Tamamlanma veya
   blokaj durumunu aşağıdaki formatlardan biriyle açıkça bildir.

## Tamamlanma Raporu

İş tamamlandıysa final cevap şu alanları içermelidir:

```text
Tamamlandı:
Kapsam:
Reuse edilen parçalar:
Yeni parça ve gerekçesi:
Değişen dosyalar:
MCP/locator kanıtı:
Statik kontroller:
Canlı test sonucu:
Allure sonucu/modu:
Notlar:
```

Yeni parça, MCP kullanımı veya not yoksa ilgili alana `YOK` yazılır. Çalışmayan
ya da atlanan bir kontrol, nedeni ile birlikte açıkça belirtilir.

## Blokaj Raporu

Zorunlu locator, yetki, test data, ekran erişimi, authoritative ID veya expected
result doğrulanamıyorsa `AGENTS.md` engelde geri alma kuralı uygulanır ve final
cevap şu formatta verilir:

```text
Bu test kodda bırakılmadı.
Kapsam:
Sebep:
Denendi:
Kanıt:
Gereken düzeltme:
Geri alınanlar:
Korunan mevcut değişiklikler:
```
