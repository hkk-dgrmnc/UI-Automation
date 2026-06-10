export type TestUser = {
  username: string;
  password: string;
};

/**
 * .env icindeki numarali kullanici bloklarini okur.
 * Her blok bir USER<N>_USERNAME / USER<N>_PASSWORD ciftidir:
 *   USER1_USERNAME=gm1
 *   USER1_PASSWORD=admin
 *   USER2_USERNAME=gm2
 *   USER2_PASSWORD=secret
 */
function loadUsers(): TestUser[] {
  const users: TestUser[] = [];

  for (const [key, value] of Object.entries(process.env)) {
    const match = key.match(/^USER(\d+)_USERNAME$/);

    if (!match || !value) {
      continue;
    }

    users.push({
      username: value,
      password: process.env[`USER${match[1]}_PASSWORD`] ?? '',
    });
  }

  return users;
}

/**
 * Step'ten gelen username'i .env'deki kullanici bloklarinin username'leri ile
 * eslestirir ve o blogun bilgilerini (username + password) dondurur.
 * Ornek: "gm1" -> USER1_USERNAME=gm1 olan blok bulunur, USER1_PASSWORD cekilir.
 */
export function getUser(username: string): TestUser {
  const user = loadUsers().find((candidate) => candidate.username === username);

  if (!user) {
    throw new Error(
      `"${username}" kullanıcısı .env içinde tanımlı değil. USER<N>_USERNAME / USER<N>_PASSWORD bloğu ekleyin.`,
    );
  }

  if (!user.password) {
    throw new Error(
      `"${username}" kullanıcısının şifresi tanımlı değil. İlgili USER<N>_PASSWORD değerini .env içine ekleyin.`,
    );
  }

  return user;
}
