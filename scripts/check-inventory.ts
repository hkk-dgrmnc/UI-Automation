/**
 * Reuse / duplicate gate + envanter ureticisi.
 *
 * Mekanik kalite kapilari:
 *
 *   1. Ayni selector'a (value) iki farkli locator ismi isaret ediyorsa -> HATA.
 *   2. LOCATOR_REPORTS icindeki `name`, kendi grup.key yolu ile uyusmuyorsa -> HATA.
 *   3. Normalize edildiginde ayni metne dusen iki step tanimi varsa -> HATA.
 *   4. Given/When/Then ilk argumani string literal degilse -> HATA.
 *   5. INVENTORY.md; step, locator ve export edilen action/assertion/flow
 *      fonksiyonlarini imza, kaynak satiri ve statik kullanim sayisiyla listeler.
 *
 * Kullanim:
 *   npm run inventory         -> denetler + INVENTORY.md'yi yeniden uretir
 *   npm run inventory:check   -> denetler + INVENTORY.md guncel mi diye dogrular (CI)
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import ts from 'typescript';
import { LOCATOR_REPORTS } from '../src/locators/locators';
import type { LocatorReport } from '../src/utils/action-report';
import { COLORS as C } from '../src/utils/console-format';

const ROOT = resolve(__dirname, '..');
const STEP_DIR = join(ROOT, 'features', 'step-definitions');
const ACTIONS_DIR = join(ROOT, 'src', 'actions');
const ASSERTIONS_DIR = join(ROOT, 'src', 'assertions');
const FLOWS_DIR = join(ROOT, 'src', 'flows');
const INVENTORY_FILE = join(ROOT, 'INVENTORY.md');

const FN_SAMPLE_ARG = '<arg>';
const STEP_KEYWORDS = new Set(['Given', 'When', 'Then']);
const SKIPPED_RECURSIVE_DIRS = new Set([
  '.git',
  'allure-report',
  'allure-results',
  'node_modules',
  'playwright-report',
]);

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function relativeFile(rootDir: string, file: string): string {
  return relative(rootDir, file).replace(/\\/g, '/');
}

// --- Locator'lari duzlestir -------------------------------------------------

export type FlatLocator = { path: string; name: string; value: string; isFn: boolean };

export function flattenLocatorReports(): FlatLocator[] {
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

export function checkLocators(locators: FlatLocator[]): string[] {
  const errors: string[] = [];

  // 1. name <-> path uyumu
  for (const loc of locators) {
    const expectedPrefix = loc.isFn ? `${loc.path}(` : loc.path;
    const ok = loc.isFn ? loc.name.startsWith(expectedPrefix) : loc.name === expectedPrefix;
    if (!ok) {
      errors.push(
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
    const distinctPaths = [...new Set(list.map((locator) => locator.path))];
    if (distinctPaths.length > 1) {
      errors.push(
        `Ayni selector birden fazla locator'da: "${value}" -> ${distinctPaths.join(', ')}. ` +
          `Tek isimde birlestir, digerlerini ona referans ver.`,
      );
    }
  }

  return errors;
}

// --- TypeScript dosyalari ---------------------------------------------------

/** Bir dizindeki .ts/.tsx dosyalarini deterministik ve recursive olarak listeler. */
export function listTsFiles(dir: string): string[] {
  const files: string[] = [];

  function visit(currentDir: string) {
    let entries;
    try {
      entries = readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIPPED_RECURSIVE_DIRS.has(entry.name)) visit(fullPath);
      } else if (/\.tsx?$/u.test(entry.name) && !entry.name.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }
  }

  visit(dir);
  return files;
}

// --- Step tanimlarini AST ile topla ----------------------------------------

export type StepEntry = { keyword: string; text: string; file: string; line: number };
export type StepCollection = { entries: StepEntry[]; errors: string[] };

function cucumberStepBindings(sourceFile: ts.SourceFile): Map<string, string> {
  // Dogrudan Given/When/Then kullanimi geriye donuk olarak desteklenir. Import
  // alias'i varsa (Given as Kosul gibi) canonical keyword'e de cozulur.
  const bindings = new Map([...STEP_KEYWORDS].map((keyword) => [keyword, keyword]));

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== '@cucumber/cucumber' ||
      !statement.importClause?.namedBindings ||
      !ts.isNamedImports(statement.importClause.namedBindings)
    ) {
      continue;
    }

    for (const element of statement.importClause.namedBindings.elements) {
      const importedName = element.propertyName?.text ?? element.name.text;
      if (STEP_KEYWORDS.has(importedName)) bindings.set(element.name.text, importedName);
    }
  }

  return bindings;
}

export function collectSteps(stepDir: string, rootDir: string): StepCollection {
  const entries: StepEntry[] = [];
  const errors: string[] = [];

  for (const file of listTsFiles(stepDir)) {
    const content = readFileSync(file, 'utf8');
    const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
    const bindings = cucumberStepBindings(sourceFile);
    const relName = relativeFile(rootDir, file);

    function visit(node: ts.Node) {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
        const keyword = bindings.get(node.expression.text);
        if (keyword) {
          const argument = node.arguments[0];
          const location = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
          const line = location.line + 1;

          if (
            argument &&
            (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument))
          ) {
            entries.push({ keyword, text: argument.text, file: relName, line });
          } else {
            const received = argument?.getText(sourceFile) ?? '<eksik>';
            errors.push(
              `${keyword} step taniminin ilk argumani string literal olmali: ` +
                `${relName}:${line} (bulunan: ${received}).`,
            );
          }
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  }

  return { entries, errors };
}

export function normalizeStep(text: string): string {
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/\{[a-z]+\}/g, '{}') // cucumber expression: {string}, {int} -> {}
    .replace(/[.,;:!?]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function checkSteps(steps: StepEntry[]): string[] {
  const errors: string[] = [];
  const byNorm = new Map<string, StepEntry[]>();
  for (const step of steps) {
    const key = normalizeStep(step.text);
    const list = byNorm.get(key) ?? [];
    list.push(step);
    byNorm.set(key, list);
  }

  for (const list of byNorm.values()) {
    if (list.length > 1) {
      const variants = list.map((step) => `"${step.text}" (${step.file}:${step.line})`).join(' | ');
      errors.push(
        `Ayni anlama gelen step birden fazla tanimli: ${variants}. Tek metinde birlestir.`,
      );
    }
  }

  return errors;
}

// --- Action / Assertion / Flow export'lari ---------------------------------

export type ExportedFunction = {
  name: string;
  signature: string;
  line: number;
  usageCount: number;
  unused: boolean;
};

export type ModuleExports = { file: string; fns: ExportedFunction[] };

type FunctionCandidate = {
  name: string;
  declaration: ts.SignatureDeclaration;
  nameNode: ts.Identifier;
  sourceFile: ts.SourceFile;
  line: number;
  symbol: ts.Symbol;
};

function diagnosticText(diagnostics: readonly ts.Diagnostic[]): string {
  return ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => ROOT,
    getNewLine: () => '\n',
  });
}

/**
 * tsconfig varsa onu kullanir; unit-test gibi izole fixture'larda tum recursive
 * TypeScript dosyalariyla kucuk bir program kurar.
 */
export function createProjectProgram(rootDir: string): ts.Program {
  const configPath = ts.findConfigFile(rootDir, ts.sys.fileExists, 'tsconfig.json');

  if (configPath) {
    const config = ts.readConfigFile(configPath, ts.sys.readFile);
    if (config.error) throw new Error(diagnosticText([config.error]));

    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, rootDir);
    if (parsed.errors.length > 0) throw new Error(diagnosticText(parsed.errors));
    return ts.createProgram({ rootNames: parsed.fileNames, options: parsed.options });
  }

  return ts.createProgram({
    rootNames: listTsFiles(rootDir),
    options: {
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      skipLibCheck: true,
      strict: true,
      target: ts.ScriptTarget.ES2022,
    },
  });
}

function hasExportModifier(node: ts.Node): boolean {
  return Boolean(
    ts.canHaveModifiers(node) &&
    ts.getModifiers(node)?.some((modifier) => {
      return modifier.kind === ts.SyntaxKind.ExportKeyword;
    }),
  );
}

function unwrapFunctionInitializer(expression: ts.Expression): ts.Expression {
  let current = expression;
  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isNonNullExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function canonicalSymbol(checker: ts.TypeChecker, symbol: ts.Symbol): ts.Symbol {
  let current = symbol;
  const visited = new Set<ts.Symbol>();

  // Named import alias'lari, `import * as x` property erisimleri ve re-export
  // zincirleri ayni declaration sembolune indirgenir.
  while ((current.flags & ts.SymbolFlags.Alias) !== 0 && !visited.has(current)) {
    visited.add(current);
    const resolved = checker.getAliasedSymbol(current);
    if (resolved === current) break;
    current = resolved;
  }

  return current;
}

function sourceFileMap(program: ts.Program): Map<string, ts.SourceFile> {
  const caseInsensitive = !ts.sys.useCaseSensitiveFileNames;
  const key = (file: string) => {
    const normalized = resolve(file).replace(/\\/g, '/');
    return caseInsensitive ? normalized.toLocaleLowerCase('en-US') : normalized;
  };

  return new Map(
    program.getSourceFiles().map((sourceFile) => [key(sourceFile.fileName), sourceFile]),
  );
}

function collectFunctionCandidates(
  dir: string,
  program: ts.Program,
): { modules: { filePath: string; candidates: FunctionCandidate[] }[]; all: FunctionCandidate[] } {
  const checker = program.getTypeChecker();
  const sources = sourceFileMap(program);
  const caseInsensitive = !ts.sys.useCaseSensitiveFileNames;
  const sourceKey = (file: string) => {
    const normalized = resolve(file).replace(/\\/g, '/');
    return caseInsensitive ? normalized.toLocaleLowerCase('en-US') : normalized;
  };
  const modules: { filePath: string; candidates: FunctionCandidate[] }[] = [];
  const all: FunctionCandidate[] = [];

  for (const file of listTsFiles(dir)) {
    const sourceFile = sources.get(sourceKey(file));
    if (!sourceFile) continue;

    const candidates: FunctionCandidate[] = [];
    const bySymbol = new Map<ts.Symbol, FunctionCandidate>();

    function addCandidate(
      nameNode: ts.Identifier,
      declaration: ts.SignatureDeclaration,
      lineNode: ts.Node,
    ) {
      const rawSymbol = checker.getSymbolAtLocation(nameNode);
      if (!rawSymbol) return;
      const symbol = canonicalSymbol(checker, rawSymbol);
      const line =
        sourceFile!.getLineAndCharacterOfPosition(lineNode.getStart(sourceFile)).line + 1;
      const candidate = {
        name: nameNode.text,
        declaration,
        nameNode,
        sourceFile: sourceFile!,
        line,
        symbol,
      };
      const previous = bySymbol.get(symbol);

      // Overload'larda govdeli implementation'i tercih et ve ayni export'u bir
      // kez listele.
      const hasBody = 'body' in declaration && Boolean(declaration.body);
      const previousHasBody =
        previous && 'body' in previous.declaration && Boolean(previous.declaration.body);
      if (!previous || (hasBody && !previousHasBody)) bySymbol.set(symbol, candidate);
    }

    for (const statement of sourceFile.statements) {
      if (ts.isFunctionDeclaration(statement) && statement.name && hasExportModifier(statement)) {
        addCandidate(statement.name, statement, statement);
        continue;
      }

      if (
        ts.isVariableStatement(statement) &&
        hasExportModifier(statement) &&
        (statement.declarationList.flags & ts.NodeFlags.Const) !== 0
      ) {
        for (const declaration of statement.declarationList.declarations) {
          if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
          const initializer = unwrapFunctionInitializer(declaration.initializer);
          if (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer)) {
            addCandidate(declaration.name, initializer, statement);
          }
        }
      }
    }

    candidates.push(...bySymbol.values());
    candidates.sort((left, right) => left.line - right.line || left.name.localeCompare(right.name));
    if (candidates.length > 0) {
      modules.push({ filePath: file, candidates });
      all.push(...candidates);
    }
  }

  return { modules, all };
}

function isImportOrExportBinding(node: ts.Identifier): boolean {
  const parent = node.parent;
  return (
    ts.isImportSpecifier(parent) ||
    ts.isImportClause(parent) ||
    ts.isNamespaceImport(parent) ||
    ts.isExportSpecifier(parent) ||
    ts.isExportAssignment(parent)
  );
}

/**
 * Export edilen fonksiyonlari ve kullanimlarini TypeScript symbol graph'iyle
 * toplar. Bu sayim named/aliased/namespace importlarini ve ayni dosyadaki
 * referanslari yakalar. String ile dispatch, reflection veya runtime dependency
 * injection gibi statik symbol referansi olmayan cagri bicimleri dogal olarak
 * sayilamaz.
 */
export function collectModuleExports(
  dir: string,
  rootDir: string,
  program: ts.Program,
): ModuleExports[] {
  const checker = program.getTypeChecker();
  const { modules, all } = collectFunctionCandidates(dir, program);
  const bySymbol = new Map(all.map((candidate) => [candidate.symbol, candidate]));
  const declarationNames = new Set(all.map((candidate) => candidate.nameNode));
  const usageCounts = new Map(all.map((candidate) => [candidate, 0]));

  for (const sourceFile of program.getSourceFiles()) {
    if (
      sourceFile.isDeclarationFile ||
      relativeFile(rootDir, sourceFile.fileName).startsWith('../')
    ) {
      continue;
    }

    function visit(node: ts.Node) {
      if (ts.isIdentifier(node) && !declarationNames.has(node) && !isImportOrExportBinding(node)) {
        const rawSymbol = checker.getSymbolAtLocation(node);
        if (rawSymbol) {
          const candidate = bySymbol.get(canonicalSymbol(checker, rawSymbol));
          if (candidate) usageCounts.set(candidate, (usageCounts.get(candidate) ?? 0) + 1);
        }
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  }

  return modules.map((module) => ({
    file: relativeFile(rootDir, module.filePath),
    fns: module.candidates.map((candidate) => {
      const signature = checker.getSignatureFromDeclaration(candidate.declaration);
      const signatureText = signature
        ? checker.signatureToString(
            signature,
            candidate.declaration,
            ts.TypeFormatFlags.NoTruncation,
          )
        : '(imza cozumlenemedi)';
      const usageCount = usageCounts.get(candidate) ?? 0;
      return {
        name: candidate.name,
        signature: `${candidate.name}${signatureText}`,
        line: candidate.line,
        usageCount,
        unused: usageCount === 0,
      };
    }),
  }));
}

// --- INVENTORY.md uret ------------------------------------------------------

function addFunctionSection(lines: string[], title: string, modules: ModuleExports[]) {
  lines.push(`## ${title}`);
  lines.push('');
  if (modules.length === 0) {
    lines.push('_(yok)_');
    lines.push('');
    return;
  }

  for (const module of modules) {
    lines.push(`### ${module.file}`);
    lines.push('');
    for (const fn of module.fns) {
      const usage = fn.unused ? 'kullanim: 0 (UNUSED)' : `kullanim: ${fn.usageCount}`;
      lines.push(`- \`${fn.signature}\` — satir ${fn.line} — ${usage}`);
    }
    lines.push('');
  }
}

export function buildInventory(
  locators: FlatLocator[],
  steps: StepEntry[],
  actions: ModuleExports[],
  assertions: ModuleExports[],
  flows: ModuleExports[],
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
  lines.push(
    '> Kullanim sayisi TypeScript sembol referansidir; string/reflection/runtime dispatch statik olarak sayilamaz.',
  );
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
  for (const locator of locators) {
    const group = locator.path.split('.')[0];
    const list = byGroup.get(group) ?? [];
    list.push(locator);
    byGroup.set(group, list);
  }
  for (const group of [...byGroup.keys()].sort()) {
    lines.push(`### ${group}`);
    lines.push('');
    for (const locator of byGroup.get(group)!) {
      lines.push(`- \`${locator.path}\`${locator.isFn ? ' (fn)' : ''} → ${locator.value}`);
    }
    lines.push('');
  }

  addFunctionSection(lines, 'Actions', actions);
  addFunctionSection(lines, 'Assertions', assertions);
  addFunctionSection(lines, 'Flows', flows);

  return (
    lines
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trimEnd() + '\n'
  );
}

// --- Calistir ---------------------------------------------------------------

export function runInventory(args: string[] = process.argv.slice(2)): number {
  const checkOnly = args.includes('--check');
  const errors: string[] = [];
  const locators = flattenLocatorReports();
  const steps = collectSteps(STEP_DIR, ROOT);
  const program = createProjectProgram(ROOT);
  const actions = collectModuleExports(ACTIONS_DIR, ROOT, program);
  const assertions = collectModuleExports(ASSERTIONS_DIR, ROOT, program);
  const flows = collectModuleExports(FLOWS_DIR, ROOT, program);

  errors.push(...checkLocators(locators), ...steps.errors, ...checkSteps(steps.entries));

  const inventory = buildInventory(locators, steps.entries, actions, assertions, flows);

  if (checkOnly) {
    let current: string;
    try {
      current = readFileSync(INVENTORY_FILE, 'utf8');
    } catch {
      current = '';
    }
    if (normalizeNewlines(current) !== normalizeNewlines(inventory)) {
      errors.push('INVENTORY.md guncel degil. `npm run inventory` calistir ve commit et.');
    }
  } else {
    writeFileSync(INVENTORY_FILE, inventory, 'utf8');
    console.log(
      `${C.green}✓${C.reset} INVENTORY.md guncellendi (${locators.length} locator, ${steps.entries.length} step).`,
    );
  }

  if (errors.length > 0) {
    console.log(`\n${C.bold}${C.red}Reuse/duplicate denetimi basarisiz:${C.reset}`);
    for (const error of errors) console.log(`${C.red}  ✗${C.reset} ${error}`);
    console.log('');
    return 1;
  }

  console.log(`${C.green}✓${C.reset} Reuse/duplicate denetimi temiz.`);
  return 0;
}

export function main() {
  process.exitCode = runInventory();
}

if (require.main === module) main();
