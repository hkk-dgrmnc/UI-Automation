@regression @adres-sablonu
Feature: YTKP-adres-sablonu cases

  Scenario: TC-001 - Adres Şablonu ekranı açılış kontrolü
    * "USER1" kullanıcısı ile login olunur
    * "Posta Çeki Hesabı İşlemleri > Adres Şablonu" menü yolundan sayfaya gidilir
    * Adres Şablonu sayfasının açıldığı doğrulanır
    * "Adres Şablonları" başlığı görüldüğü doğrulanır
    * Tabloda aşağıdaki kolon başlıkları listelenir
      | Kod  |
      | Ad   |
      | Ülke |
    * Oluştur butonuna tıklanır
    * Adres Şablonu oluşturma ekranının açıldığı doğrulanır
    * "Address Şablonu" başlığı görüldüğü doğrulanır
    * Sayfada aşağıdaki input alanları görüntülenir
      | Kod  |
      | Ad   |
      | Ülke |
    * "Alanlar" başlığı görüldüğü doğrulanır
    * "Ekle" butonu görüldüğü doğrulanır
