/**
 * Reuse / duplicate gate + envanter ureticisi.
 *
 * AGENTS.md'deki "ayni locator/step'i tekrar tekrar uretme" kurali bugune kadar
 * sadece tavsiyeydi (AI `rg` ile arasin diye). Bu script o kurali mekanik kapiya
 * cevirir:
 *
 *   1. Ayni selector'a (value) iki farkli locator ismi isaret ediyorsa -> HATA.
 *   2. LOCATOR_REPORTS icindeki `name`, kendi grup.key yolu ile uyusmuyorsa -> HATA
 *      (kopyala-yapistir sonucu yanlis raporlanan locator'i yakalar).
 *   3. Normalize edildiginde ayni metne dusen iki step tanimi varsa -> HATA
 *      (ornek: "Oluştur butonuna tıklanır" vs "Oluştur butonuna tıklanır.").
 *   4. INVENTORY.md uretir: mevcut step / locator / action / assertion / flow sozlugu.
 *      Yeni test yazmadan once tek dosyadan reuse aramak icin.
 *
 * Kullanim:
 *   npm run inventory         -> denetler + INVENTORY.md'yi yeniden uretir
 *   npm run inventory:check   -> denetler + INVENTORY.md guncel mi diye dogrular (CI)
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COLORS as C } from '../src/utils/console-format';
import { LOCATOR_REPORTS } from '../src/locators/locators';
import type { LocatorReport } from '../src/utils/action-report';

const ROOT = join(__dirname, '..');
const STEP_DIR = join(ROOT, 'features', 'step-definitions');
const ACTIONS_DIR = join(ROOT, 'src', 'actions');
const ASSERTIONS_DIR = join(ROOT, 'src', 'assertions');
const FLOWS_DIR = join(ROOT, 'src', 'flows');
const INVENTORY_FILE = join(ROOT, 'INVENTORY.md');

const FN_SAMPLE_ARG = '<arg>';

const errors: string[] = [];
const addError = (message: string) => errors.push(message);

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

// --- Locator'lari duzlestir -------------------------------------------------

type FlatLocator = { path: string; name: string; value: string; isFn: boolean };

function flattenLocatorReports(): FlatLocator[] {
  const out: FlatLocator[] = [];

  for (const [group, entries] of Object.entries(LOCATOR_REPORTS)) {
    for (const [key, entry] of Object.entries(entries as Record<string, unknown>)) {
      const path = `${group}.${key}`;

      if (typeof entry === 'function') {
        // Bir locator-report fonksiyonu birden fazla parametre alabilir
        // (orn. optionInListbox(listboxId, name)). Her parametreye ornek arg
        // verilir; aksi halde eksik parametreler raporda "undefined" gorunur.
        const fn = entry as (...args: string[]) => LocatorReport;
        const sampleArgs = Array.from({ length: Math.max(fn.length, 1) }, () => FN_SAMPLE_ARG);
        const report = fn(...sampleArgs);
        out.push({ path, name: report.name, value: report.value, isFn: true });
      } else {
        const report = entry as LocatorReport;
        out.push({ path, name: report.name, value: report.value, isFn: false });
      }
    }
  }

  return out;
}

function checkLocators(locators: FlatLocator[]) {
  // 1. name <-> path uyumu
  for (const loc of locators) {
    const expectedPrefix = loc.isFn ? `${loc.path}(` : loc.path;
    const ok = loc.isFn ? loc.name.startsWith(expectedPrefix) : loc.name === expectedPrefix;
    if (!ok) {
      addError(
        `LOCATOR_REPORTS.${loc.path} -> name "${loc.name}" yolu ile uyusmuyor ` +
          `(beklenen: "${loc.path}"). Kopyala-yapistir hatasi olabilir.`,
      );
    }
  }

  // 2. Ayni value'ya birden fazla isim
  const byValue = new Map<string, FlatLocator[]>();
  for (const loc of locators) {
    const key = loc.value.trim();
    const list = byValue.get(key) ?? [];
    list.push(loc);
    byValue.set(key, list);
  }

  for (const [value, list] of byValue) {
    const distinctPaths = [...new Set(list.map((l) => l.path))];
    if (distinctPaths.length > 1) {
      addError(
        `Ayni selector birden fazla locator'da: "${value}" -> ${distinctPaths.join(', ')}. ` +
          `Tek isimde birlestir, digerlerini ona referans ver.`,
      );
    }
  }
}

// --- Step tanimlarini topla -------------------------------------------------

type StepEntry = { keyword: string; text: string; file: string };

const STEP_RE = /\b(Given|When|Then)\s*\(\s*(['"`])((?:\\.|(?!\2).)*)\2/g;

function listTsFiles(dir: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  return entries.filter((name) => name.endsWith('.ts')).map((name) => join(dir, name));
}

function collectSteps(): StepEntry[] {
  const out: StepEntry[] = [];

  for (const file of listTsFiles(STEP_DIR)) {
    const content = readFileSync(file, 'utf8');
    const relName = file.slice(ROOT.length + 1).replace(/\\/g, '/');
    for (const match of content.matchAll(STEP_RE)) {
      out.push({ keyword: match[1], text: match[3], file: relName });
    }
  }

  return out;
}

function normalizeStep(text: string): string {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/\{[a-z]+\}/g, '{}') // cucumber expression: {string}, {int} -> {}
    .replace(/[.,;:!?]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function checkSteps(steps: StepEntry[]) {
  const byNorm = new Map<string, StepEntry[]>();
  for (const step of steps) {
    const key = normalizeStep(step.text);
    const list = byNorm.get(key) ?? [];
    list.push(step);
    byNorm.set(key, list);
  }

  for (const [, list] of byNorm) {
    if (list.length > 1) {
      const variants = list.map((s) => `"${s.text}" (${s.file})`).join(' | ');
      addError(`Ayni anlama gelen step birden fazla tanimli: ${variants}. Tek metinde birlestir.`);
    }
  }
}

// --- Action / Flow export'lari ----------------------------------------------

const EXPORT_FN_RE = /export\s+(?:async\s+)?function\s+(\w+)/g;

function collectExportedFns(file: string): string[] {
  let content: string;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    return [];
  }
  return [...content.matchAll(EXPORT_FN_RE)].map((m) => m[1]);
}

// Bir dizindeki her .ts dosyasinin export'lanan fonksiyonlarini dosya bazli toplar.
// Hem actions (common/auth/navigation/... domain dosyalari) hem flows icin kullanilir.
function collectModuleExports(dir: string): { file: string; fns: string[] }[] {
  return listTsFiles(dir)
    .map((file) => ({
      file: file.slice(ROOT.length + 1).replace(/\\/g, '/'),
      fns: collectExportedFns(file),
    }))
    .filter((entry) => entry.fns.length > 0);
}

// --- INVENTORY.md uret ------------------------------------------------------

function buildInventory(
  locators: FlatLocator[],
  steps: StepEntry[],
  actions: { file: string; fns: string[] }[],
  assertions: { file: string; fns: string[] }[],
  flows: { file: string; fns: string[] }[],
): string {
  const lines: string[] = [];

  lines.push('# INVENTORY');
  lines.push('');
  lines.push('> Otomatik uretildi — elle duzenleme. `npm run inventory` ile guncellenir.');
  lines.push(
    '> Yeni step/locator/action/assertion/flow yazmadan ONCE burada reuse ara (AGENTS.md 5.2).',
  );
  lines.push('> `common` ve `navigation` gruplari sadece birden fazla sayfada kullanilan');
  lines.push('> elemanlar icindir; sayfaya ozel olanlar domain grubunda tutulur.');
  lines.push('');

  lines.push('## Steps');
  lines.push('');
  if (steps.length === 0) {
    lines.push('_(yok)_');
  } else {
    const byFile = new Map<string, StepEntry[]>();
    for (const step of steps) {
      const list = byFile.get(step.file) ?? [];
      list.push(step);
      byFile.set(step.file, list);
    }
    for (const file of [...byFile.keys()].sort()) {
      lines.push(`### ${file}`);
      lines.push('');
      for (const step of byFile.get(file)!) {
        lines.push(`- \`${step.keyword}\` ${step.text}`);
      }
      lines.push('');
    }
  }

  lines.push('## Locators');
  lines.push('');
  const byGroup = new Map<string, FlatLocator[]>();
  for (const loc of locators) {
    const group = loc.path.split('.')[0];
    const list = byGroup.get(group) ?? [];
    list.push(loc);
    byGroup.set(group, list);
  }
  for (const group of [...byGroup.keys()].sort()) {
    lines.push(`### ${group}`);
    lines.push('');
    for (const loc of byGroup.get(group)!) {
      lines.push(`- \`${loc.path}\`${loc.isFn ? ' (fn)' : ''} → ${loc.value}`);
    }
    lines.push('');
  }

  lines.push('## Actions');
  lines.push('');
  if (actions.length === 0) {
    lines.push('_(yok)_');
    lines.push('');
  } else {
    for (const mod of actions) {
      lines.push(`### ${mod.file}`);
      lines.push('');
      for (const fn of mod.fns) lines.push(`- \`${fn}()\``);
      lines.push('');
    }
  }

  lines.push('## Assertions');
  lines.push('');
  if (assertions.length === 0) {
    lines.push('_(yok)_');
    lines.push('');
  } else {
    for (const mod of assertions) {
      lines.push(`### ${mod.file}`);
      lines.push('');
      for (const fn of mod.fns) lines.push(`- \`${fn}()\``);
      lines.push('');
    }
  }

  lines.push('## Flows');
  lines.push('');
  if (flows.length === 0) {
    lines.push('_(yok)_');
  } else {
    for (const flow of flows) {
      lines.push(`### ${flow.file}`);
      lines.push('');
      for (const fn of flow.fns) lines.push(`- \`${fn}()\``);
      lines.push('');
    }
  }

  return (
    lines
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trimEnd() + '\n'
  );
}

// --- Calistir ---------------------------------------------------------------

function main() {
  const checkOnly = process.argv.includes('--check');

  const locators = flattenLocatorReports();
  const steps = collectSteps();
  const actions = collectModuleExports(ACTIONS_DIR);
  const assertions = collectModuleExports(ASSERTIONS_DIR);
  const flows = collectModuleExports(FLOWS_DIR);

  checkLocators(locators);
  checkSteps(steps);

  const inventory = buildInventory(locators, steps, actions, assertions, flows);

  if (checkOnly) {
    let current: string;
    try {
      current = readFileSync(INVENTORY_FILE, 'utf8');
    } catch {
      current = '';
    }
    if (normalizeNewlines(current) !== normalizeNewlines(inventory)) {
      addError('INVENTORY.md guncel degil. `npm run inventory` calistir ve commit et.');
    }
  } else {
    writeFileSync(INVENTORY_FILE, inventory, 'utf8');
    console.log(
      `${C.green}✓${C.reset} INVENTORY.md guncellendi (${locators.length} locator, ${steps.length} step).`,
    );
  }

  if (errors.length > 0) {
    console.log(`\n${C.bold}${C.red}Reuse/duplicate denetimi basarisiz:${C.reset}`);
    for (const err of errors) {
      console.log(`${C.red}  ✗${C.reset} ${err}`);
    }
    console.log('');
    process.exit(1);
  }

  console.log(`${C.green}✓${C.reset} Reuse/duplicate denetimi temiz.`);
}

main();
