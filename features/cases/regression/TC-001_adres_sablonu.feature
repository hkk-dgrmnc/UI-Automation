@regression
Feature: Posta Çeki Hesabı İşlemleri

  @adres-sablonu
  Scenario: adres-sablonu
    * "USER1" kullanıcısı ile login olunur
    * "Posta Çeki Hesabı İşlemleri > Adres Şablonu" menü yolundan sayfaya gidilir
    * Adres Şablonu sayfasının açıldığı doğrulanır
    * "Adres Şablonları" başlığı görüldüğü doğrulanır
    * Tabloda aşağıdaki kolon başlıkları listelenir
      | Kod  |
      | Ad   |
      | Ülke |
    * "Oluştur" butonuna tıklanır
    * Adres Şablonu oluşturma ekranının açıldığı doğrulanır
    * "Address Şablonu" başlığı görüldüğü doğrulanır
    * Sayfada aşağıdaki input alanları görüntülenir
      | Kod  |
      | Ad   |
      | Ülke |
    * "Alanlar" başlığı görüldüğü doğrulanır
    * "Ekle" butonu görüldüğü doğrulanır

  @kimlik-sablonu
  Scenario: kimlik-sablonu
    * "USER1" kullanıcısı ile login olunur
    * "Posta Çeki Hesabı İşlemleri > Kimlik Şablonu" menü yolundan sayfaya gidilir
    * "Kimlik Şablonu" menüsünün seçili olduğu doğrulanır
    * Kimlik Şablonu sayfasının açıldığı doğrulanır
    * "Kimlik Şablonu" başlığı görüldüğü doğrulanır
    * Tabloda aşağıdaki kolon başlıkları listelenir
      | Kod       |
      | Hesap Adı |
    * "Oluştur" butonuna tıklanır
    * "Kimlik Türü Tanım" başlığı görüldüğü doğrulanır
    * Sayfada aşağıdaki input alanları görüntülenir
      | Kod       |
      | Hesap Adı |
    * "Ekle" butonu görüldüğü doğrulanır
    * "Alanlar" başlığı görüldüğü doğrulanır
    * Bulunulan sayfanın görünen iş içerikleri dil kontrolü için raporlanır
    * "Ekle" butonuna tıklanır
    * Sayfada aşağıdaki input alanları görüntülenir
      | Alan      |
    * Bulunulan sayfanın görünen iş içerikleri dil kontrolü için raporlanır

  Scenario: kimlik-sablonu-test2
    * "USER1" kullanıcısı ile login olunur
    * "Posta Çeki Hesabı İşlemleri > Kimlik Şablonu" menü yolundan sayfaya gidilir
    * "Kimlik Şablonu" menüsünün seçili olduğu doğrulanır
    * Kimlik Şablonu sayfasının açıldığı doğrulanır
    * "Kimlik Şablonu" başlığı görüldüğü doğrulanır
    * Tabloda aşağıdaki kolon başlıkları listelenir
      | Kod       |
      | Hesap Adı |
    * Tablonun "Kod" isimli kolon başlığının altında aşağıdaki değerler listelenir
      | SURUCUBELGESI |
      | PASAPORT      |
    * Tablonun "Hesap Adı" isimli kolon başlığının altında aşağıdaki değerler listelenir
      | Sürücü Belgesi |
      | Pasaport       |
    * "Düzenle" butonunun görülmediği doğrulanır
    * "Sil" butonunun görülmediği doğrulanır
    * Tablonun "Kod" isimli kolon başlığının altındandaki "PASAPORT" değere tıklanır
    * "Düzenle" butonunun görülmediği doğrulanır
    * "Sil" butonu görüldüğü doğrulanır

  @musteri-grubu
  Scenario: musteri-grubu
    * "USER1" kullanıcısı ile login olunur
    * "Posta Çeki Hesabı İşlemleri > Müşteri Grubu" menü yolundan sayfaya gidilir
    * "Müşteri Grubu" menüsünün seçili olduğu doğrulanır
    * "Müşteri Grup Listesi" başlığı görüldüğü doğrulanır
    * "Müşteri Grup Kodu" input alanına "12345678" değeri yazılır
    * "Müşteri Grup Adı" input alanına "grup adı" değeri yazılır
    * "Müşteri Grup Kodu" input alanında girilen karakter sayısı 9 değerinden küçük veya eşit olduğu doğrulanır
    * "Müşteri Grup Adı" input alanında girilen karakter sayısı 9 değerinden küçük veya eşit olduğu doğrulanır
