export function normalizePriceText(priceText: string) {
  return priceText
    .replace(/TL|TRY/gi, '')
    .replace(/\s+/g, '')
    .trim();
}
