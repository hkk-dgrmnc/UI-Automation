const assert = require('node:assert/strict');
const { mkdirSync, mkdtempSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const test = require('node:test');
require('ts-node/register');

const {
  buildInventory,
  checkLocators,
  checkSteps,
  collectModuleExports,
  collectSteps,
  createProjectProgram,
} = require('../../scripts/check-inventory');

function fixture(context) {
  const root = mkdtempSync(join(tmpdir(), 'inventory-policy-'));
  context.after(() => rmSync(root, { force: true, recursive: true }));
  return root;
}

function write(root, relativePath, content) {
  const fullPath = join(root, relativePath);
  mkdirSync(join(fullPath, '..'), { recursive: true });
  writeFileSync(fullPath, content, 'utf8');
}

test('collectSteps recursively reads literals and rejects dynamic definitions', (context) => {
  const root = fixture(context);
  const stepDir = join(root, 'features', 'step-definitions');
  write(
    root,
    'features/step-definitions/nested/example.steps.ts',
    [
      "import { Given, When as Eylem, Then } from '@cucumber/cucumber';",
      "Given('literal step', () => {});",
      'Eylem(`template step`, () => {});',
      "const dynamicStep = 'dynamic step';",
      'Then(dynamicStep, () => {});',
      'Then(`dynamic ${dynamicStep}`, () => {});',
    ].join('\n'),
  );

  const result = collectSteps(stepDir, root);

  assert.deepEqual(
    result.entries.map(({ keyword, text, file, line }) => ({ keyword, text, file, line })),
    [
      {
        keyword: 'Given',
        text: 'literal step',
        file: 'features/step-definitions/nested/example.steps.ts',
        line: 2,
      },
      {
        keyword: 'When',
        text: 'template step',
        file: 'features/step-definitions/nested/example.steps.ts',
        line: 3,
      },
    ],
  );
  assert.equal(result.errors.length, 2);
  assert.match(result.errors[0], /string literal olmali/u);
  assert.match(result.errors[0], /example\.steps\.ts:5/u);
  assert.match(result.errors[1], /example\.steps\.ts:6/u);
});

test('duplicate locator and normalized step policies remain enforced', () => {
  const locatorErrors = checkLocators([
    { path: 'common.save', name: 'common.wrong', value: '#save', isFn: false },
    { path: 'domain.save', name: 'domain.save', value: '#save', isFn: false },
  ]);
  const stepErrors = checkSteps([
    { keyword: 'When', text: 'Kaydet butonuna tiklanir', file: 'a.ts', line: 1 },
    { keyword: 'When', text: 'Kaydet butonuna tiklanir.', file: 'b.ts', line: 2 },
  ]);

  assert.equal(locatorErrors.length, 2);
  assert.match(locatorErrors[0], /yolu ile uyusmuyor/u);
  assert.match(locatorErrors[1], /Ayni selector/u);
  assert.equal(stepErrors.length, 1);
  assert.match(stepErrors[0], /Ayni anlama gelen step/u);
});

test('collectModuleExports captures function forms, signatures, lines, and symbol-aware usage', (context) => {
  const root = fixture(context);
  const actionsDir = join(root, 'src', 'actions');
  write(
    root,
    'src/actions/nested/sample.actions.ts',
    [
      'export function declared(value: string): string { return value; }',
      'export const arrow = (amount = 1) => declared(String(amount));',
      'export const expression = function (flag: boolean): boolean { return flag; };',
      'export const unused = () => 42;',
      'const hidden = () => false;',
      'export { hidden };',
    ].join('\n'),
  );
  write(
    root,
    'src/consumer.ts',
    [
      "import { declared as callDeclared, arrow } from './actions/nested/sample.actions';",
      "import * as api from './actions/nested/sample.actions';",
      "callDeclared('x');",
      'api.arrow();',
      'const callback = api.expression;',
      'void callback;',
      'void arrow;',
    ].join('\n'),
  );

  const program = createProjectProgram(root);
  const modules = collectModuleExports(actionsDir, root, program);

  assert.equal(modules.length, 1);
  assert.equal(modules[0].file, 'src/actions/nested/sample.actions.ts');
  assert.deepEqual(
    modules[0].fns.map(({ name, line, usageCount, unused }) => ({
      name,
      line,
      usageCount,
      unused,
    })),
    [
      { name: 'declared', line: 1, usageCount: 2, unused: false },
      { name: 'arrow', line: 2, usageCount: 2, unused: false },
      { name: 'expression', line: 3, usageCount: 1, unused: false },
      { name: 'unused', line: 4, usageCount: 0, unused: true },
    ],
  );
  assert.equal(modules[0].fns[0].signature, 'declared(value: string): string');
  assert.equal(modules[0].fns[1].signature, 'arrow(amount?: number): string');

  const inventory = buildInventory([], [], modules, [], []);
  assert.match(inventory, /declared\(value: string\): string` — satir 1 — kullanim: 2/u);
  assert.match(inventory, /unused\(\): number` — satir 4 — kullanim: 0 \(UNUSED\)/u);
});
