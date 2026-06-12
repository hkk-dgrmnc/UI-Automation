export type TestUser = {
  username: string;
  password: string;
};

/**
 * Step'ten gelen kullanici anahtarini (.env'deki blok adi) ilgili
 * USER<N>_USERNAME / USER<N>_PASSWORD degerleri ile eslestirir.
 * Ornek: "USER1" -> USER1_USERNAME ve USER1_PASSWORD okunur.
 * Boylece feature dosyasinda gercek kullanici adi veya sifre gecmez.
 */
export function getUser(userKey: string): TestUser {
  const username = process.env[`${userKey}_USERNAME`];
  const password = process.env[`${userKey}_PASSWORD`];

  if (!username) {
    throw new Error(
      `"${userKey}" kullanıcısı .env içinde tanımlı değil. ${userKey}_USERNAME / ${userKey}_PASSWORD bloğu ekleyin.`,
    );
  }

  if (!password) {
    throw new Error(
      `"${userKey}" kullanıcısının şifresi tanımlı değil. ${userKey}_PASSWORD değerini .env içine ekleyin.`,
    );
  }

  return { username, password };
}
