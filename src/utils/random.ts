export function randomEmail(domain = 'test.com') {
  return `test_${Date.now()}_${Math.floor(Math.random() * 10000)}@${domain}`;
}
