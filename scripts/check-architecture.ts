/**
 * AST-based architecture policy gate.
 *
 * The checks in this file keep Playwright details in their intended layers:
 * step definitions orchestrate actions/flows/assertions, actions mutate the UI,
 * and assertions only observe it. The project intentionally does not use Page
 * Object classes or fixed sleeps.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';

const DEFAULT_ROOT = resolve(__dirname, '..');
const SOURCE_ROOTS = ['src', 'features'] as const;

const STEP_RAW_METHODS = new Set([
  'locator',
  'getByRole',
  'getByText',
  'getByLabel',
  'getByPlaceholder',
]);

const ASSERTION_MUTATION_METHODS = new Set([
  'click',
  'fill',
  'press',
  'selectOption',
  'hover',
  'check',
  'uncheck',
  'setInputFiles',
  'dragTo',
]);

export type ArchitectureViolationCode =
  | 'step-playwright-import'
  | 'step-locator-import'
  | 'step-raw-playwright'
  | 'action-expect-import'
  | 'action-expect-call'
  | 'assertion-mutation'
  | 'wait-for-timeout'
  | 'page-object-directory'
  | 'page-object-class';

export type ArchitectureViolation = {
  code: ArchitectureViolationCode;
  file: string;
  line: number;
  column: number;
  message: string;
};

function normalizePath(value: string): string {
  return value.replace(/\\/g, '/');
}

function isPathWithin(file: string, directory: string): boolean {
  return (
    file === directory ||
    file.startsWith(`${directory}/`) ||
    file.includes(`/${directory}/`) ||
    file.endsWith(`/${directory}`)
  );
}

function isStepDefinition(file: string): boolean {
  return isPathWithin(file, 'features/step-definitions');
}

function isAction(file: string): boolean {
  return isPathWithin(file, 'src/actions');
}

function isAssertion(file: string): boolean {
  return isPathWithin(file, 'src/assertions');
}

function isPageObjectDirectory(file: string): boolean {
  return isPathWithin(file, 'src/pages');
}

function moduleTargetsLocators(moduleName: string, importingFile: string): boolean {
  const normalizedModule = normalizePath(moduleName);
  if (isPathWithin(normalizedModule, 'src/locators')) return true;

  if (!normalizedModule.startsWith('.')) return false;

  const resolvedModule = normalizePath(
    join(dirname(normalizePath(importingFile)), normalizedModule),
  );
  return isPathWithin(resolvedModule, 'src/locators');
}

function unwrapExpression(expression: ts.Expression): ts.Expression {
  let current = expression;

  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isNonNullExpression(current)
  ) {
    current = current.expression;
  }

  return current;
}

function staticPropertyName(expression: ts.Expression): string | undefined {
  const target = unwrapExpression(expression);

  if (ts.isIdentifier(target)) return target.text;
  if (ts.isPropertyAccessExpression(target)) return target.name.text;
  if (
    ts.isElementAccessExpression(target) &&
    target.argumentExpression &&
    (ts.isStringLiteral(target.argumentExpression) ||
      ts.isNoSubstitutionTemplateLiteral(target.argumentExpression))
  ) {
    return target.argumentExpression.text;
  }

  return undefined;
}

function callReceiver(expression: ts.Expression): ts.Expression | undefined {
  const target = unwrapExpression(expression);
  if (ts.isPropertyAccessExpression(target) || ts.isElementAccessExpression(target)) {
    return target.expression;
  }
  return undefined;
}

function rootIdentifier(expression: ts.Expression): string | undefined {
  let current = unwrapExpression(expression);

  while (ts.isPropertyAccessExpression(current) || ts.isElementAccessExpression(current)) {
    current = unwrapExpression(current.expression);
  }

  return ts.isIdentifier(current) ? current.text : undefined;
}

function isGetPageCall(expression: ts.Expression): boolean {
  const target = unwrapExpression(expression);
  return ts.isCallExpression(target) && staticPropertyName(target.expression) === 'getPage';
}

function isPageProperty(expression: ts.Expression): boolean {
  const target = unwrapExpression(expression);
  return (
    (ts.isPropertyAccessExpression(target) || ts.isElementAccessExpression(target)) &&
    staticPropertyName(target) === 'page'
  );
}

function collectRawPlaywrightAliases(sourceFile: ts.SourceFile): Set<string> {
  const aliases = new Set(['page', 'locator']);

  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const initializer = unwrapExpression(node.initializer);
      if (
        isGetPageCall(initializer) ||
        isPageProperty(initializer) ||
        (ts.isCallExpression(initializer) &&
          STEP_RAW_METHODS.has(staticPropertyName(initializer.expression) ?? ''))
      ) {
        aliases.add(node.name.text);
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return aliases;
}

function isRawPlaywrightReceiver(expression: ts.Expression, aliases: Set<string>): boolean {
  const target = unwrapExpression(expression);
  if (isGetPageCall(target) || isPageProperty(target)) return true;
  if (ts.isIdentifier(target)) return aliases.has(target.text);
  if (ts.isPropertyAccessExpression(target) || ts.isElementAccessExpression(target)) {
    if (staticPropertyName(target) === 'locator') return true;
    return isRawPlaywrightReceiver(target.expression, aliases);
  }
  return false;
}

function importedPlaywrightExpectNames(sourceFile: ts.SourceFile): {
  expectNames: Set<string>;
  namespaceNames: Set<string>;
} {
  const expectNames = new Set<string>(['expect']);
  const namespaceNames = new Set<string>();

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== '@playwright/test' ||
      !statement.importClause
    ) {
      continue;
    }

    const bindings = statement.importClause.namedBindings;
    if (bindings && ts.isNamespaceImport(bindings)) {
      namespaceNames.add(bindings.name.text);
    }

    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        if ((element.propertyName ?? element.name).text === 'expect') {
          expectNames.add(element.name.text);
        }
      }
    }
  }

  return { expectNames, namespaceNames };
}

function isPlaywrightExpectCall(
  expression: ts.Expression,
  expectNames: Set<string>,
  namespaceNames: Set<string>,
): boolean {
  const target = unwrapExpression(expression);
  const root = rootIdentifier(target);

  if (root && expectNames.has(root)) return true;

  if (root && namespaceNames.has(root)) {
    let current = target;
    while (ts.isPropertyAccessExpression(current) || ts.isElementAccessExpression(current)) {
      if (staticPropertyName(current) === 'expect') return true;
      current = unwrapExpression(current.expression);
    }
  }

  return false;
}

function importedName(
  declaration: ts.ImportDeclaration,
  imported: string,
): ts.ImportSpecifier | undefined {
  const bindings = declaration.importClause?.namedBindings;
  if (!bindings || !ts.isNamedImports(bindings)) return undefined;
  return bindings.elements.find(
    (element) => (element.propertyName ?? element.name).text === imported,
  );
}

/** Analyze one TypeScript source without reading or changing the filesystem. */
export function analyzeArchitectureSource(
  sourceText: string,
  fileName: string,
): ArchitectureViolation[] {
  const normalizedFile = normalizePath(fileName);
  const sourceFile = ts.createSourceFile(
    normalizedFile,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const violations: ArchitectureViolation[] = [];
  const rawPlaywrightAliases = collectRawPlaywrightAliases(sourceFile);
  const { expectNames, namespaceNames } = importedPlaywrightExpectNames(sourceFile);

  const addViolation = (code: ArchitectureViolationCode, node: ts.Node, message: string): void => {
    const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    violations.push({
      code,
      file: normalizedFile,
      line: position.line + 1,
      column: position.character + 1,
      message,
    });
  };

  if (isPageObjectDirectory(normalizedFile)) {
    addViolation(
      'page-object-directory',
      sourceFile,
      '`src/pages` is forbidden; keep behavior in action/assertion/flow modules.',
    );
  }

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const moduleName = node.moduleSpecifier.text;

      if (isStepDefinition(normalizedFile) && moduleName === '@playwright/test') {
        addViolation(
          'step-playwright-import',
          node,
          'Step definitions must not import Playwright directly.',
        );
      }

      if (isStepDefinition(normalizedFile) && moduleTargetsLocators(moduleName, normalizedFile)) {
        addViolation(
          'step-locator-import',
          node,
          'Step definitions must not import the locator layer directly.',
        );
      }

      if (
        isAction(normalizedFile) &&
        moduleName === '@playwright/test' &&
        importedName(node, 'expect')
      ) {
        addViolation(
          'action-expect-import',
          importedName(node, 'expect')!,
          'Actions must not import Playwright expect; assertions belong in src/assertions.',
        );
      }
    }

    if (ts.isClassLike(node) && node.name && /Page$/u.test(node.name.text)) {
      addViolation(
        'page-object-class',
        node.name,
        `Page Object class "${node.name.text}" is forbidden.`,
      );
    }

    if (ts.isCallExpression(node)) {
      const calledName = staticPropertyName(node.expression);
      const receiver = callReceiver(node.expression);

      if (calledName === 'waitForTimeout') {
        addViolation(
          'wait-for-timeout',
          node.expression,
          'waitForTimeout is forbidden; use a web-first condition or centralized timeout.',
        );
      }

      if (
        isStepDefinition(normalizedFile) &&
        ((calledName !== undefined && STEP_RAW_METHODS.has(calledName)) ||
          (receiver !== undefined && isRawPlaywrightReceiver(receiver, rawPlaywrightAliases)))
      ) {
        addViolation(
          'step-raw-playwright',
          node.expression,
          `Step definitions must not call raw Playwright method "${calledName ?? 'unknown'}".`,
        );
      }

      if (
        isAction(normalizedFile) &&
        isPlaywrightExpectCall(node.expression, expectNames, namespaceNames)
      ) {
        addViolation(
          'action-expect-call',
          node.expression,
          'Actions must not call expect; move the check to src/assertions.',
        );
      }

      if (
        isAssertion(normalizedFile) &&
        calledName !== undefined &&
        ASSERTION_MUTATION_METHODS.has(calledName)
      ) {
        addViolation(
          'assertion-mutation',
          node.expression,
          `Assertions must not perform mutating UI operation "${calledName}".`,
        );
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return violations;
}

function listTypeScriptFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];

  const files: string[] = [];
  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...listTypeScriptFiles(fullPath));
    } else if (entry.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

/** Analyze the automation source tree and return stable, source-ordered violations. */
export function analyzeArchitectureProject(root = DEFAULT_ROOT): ArchitectureViolation[] {
  const absoluteRoot = resolve(root);
  const sourceFiles = SOURCE_ROOTS.flatMap((directory) =>
    listTypeScriptFiles(join(absoluteRoot, directory)),
  ).sort();
  const violations = sourceFiles.flatMap((file) =>
    analyzeArchitectureSource(
      readFileSync(file, 'utf8'),
      normalizePath(relative(absoluteRoot, file)),
    ),
  );

  const pagesDirectory = join(absoluteRoot, 'src', 'pages');
  if (
    existsSync(pagesDirectory) &&
    !violations.some((violation) => violation.code === 'page-object-directory')
  ) {
    violations.push({
      code: 'page-object-directory',
      file: 'src/pages',
      line: 1,
      column: 1,
      message: '`src/pages` is forbidden; keep behavior in action/assertion/flow modules.',
    });
  }

  return violations.sort(
    (left, right) =>
      left.file.localeCompare(right.file) ||
      left.line - right.line ||
      left.column - right.column ||
      left.code.localeCompare(right.code),
  );
}

export function formatArchitectureViolation(violation: ArchitectureViolation): string {
  return `${violation.file}:${violation.line}:${violation.column} [${violation.code}] ${violation.message}`;
}

export function main(root = DEFAULT_ROOT): number {
  const violations = analyzeArchitectureProject(root);

  if (violations.length === 0) {
    console.log('Architecture policy check passed.');
    return 0;
  }

  console.error(`Architecture policy check failed (${violations.length} violation(s)):`);
  for (const violation of violations) {
    console.error(`  - ${formatArchitectureViolation(violation)}`);
  }
  return 1;
}

if (require.main === module) {
  process.exitCode = main();
}
