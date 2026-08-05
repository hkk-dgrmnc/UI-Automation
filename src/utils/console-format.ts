// Ortak ANSI renk kodlari ve konsol hizalama sabitleri.
// Hem raporlama altyapisi (action-report) hem Cucumber hook'lari (hooks)
// ve ozet formatter ayni renkleri buradan kullanir; tekrar tanimlanmaz.
export const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[96m',
  green: '\x1b[92m',
  red: '\x1b[91m',
  gray: '\x1b[90m',
  yellow: '\x1b[93m',
  white: '\x1b[97m',
} as const;

export const INDENT = '        ';
