/**
 * Senaryo-anlik (runtime) deger deposu.
 *
 * Test sirasinda yakalanan dinamik degerleri (orn. dropdown'dan secilen secenek,
 * uretilen kayit ID'si, ekrandaki bir metin) bir isimle saklamak ve sonraki
 * adimlarda o isimle geri okumak icindir.
 *
 * Bu test datasi DEGILDIR: statik test verisi `src/data/data.ts` icinde durur.
 * Burada tutulan sey, sadece o senaryo calisirken olusan gecici durumdur.
 *
 * Yasam dongusu: her senaryo icin yeni bir CustomWorld olusur (Before/After
 * hook'lari), dolayisiyla her senaryo kendi bos store'u ile baslar. Bir
 * senaryoda kaydedilen deger digerine sizmaz; izolasyon otomatiktir.
 *
 * Deger tipi `unknown` tutulur ki ileride string disi degerler (sayi, ID, satir
 * sayisi, obje) de saklanabilsin; okurken beklenen tip `get<T>()` ile verilir,
 * varsayilan `string`'tir.
 */
export class ScenarioStore {
  private readonly values = new Map<string, unknown>();

  /** `name` anahtariyla bir deger saklar; ayni isim tekrar yazilirsa uzerine yazar. */
  save(name: string, value: unknown): void {
    this.values.set(name, value);
  }

  /** `name` anahtariyla saklanmis bir deger var mi? */
  has(name: string): boolean {
    return this.values.has(name);
  }

  /**
   * `name` ile saklanan degeri dondurur. Once kaydedilmemisse net hata firlatir
   * (sessizce `undefined` tasimaz). Beklenen tip generic ile verilir, varsayilan
   * `string`.
   */
  get<T = string>(name: string): T {
    if (!this.values.has(name)) {
      throw new Error(`"${name}" adiyla kaydedilmis bir deger yok. Once kaydeden adimi calistirin.`);
    }

    return this.values.get(name) as T;
  }
}
