// Birden fazla domain (locators, assertions) ayni regex kacis mantigini kullaniyor;
// tek kaynak olarak burada tutulur (AGENTS.md 14). Elle kopyalanmaz.

/** Kullanici metnini literal olarak regex'e gomer: tum regex metakarakterlerini kacislar. */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
