const assert = require('node:assert/strict');
const test = require('node:test');
require('ts-node/register');

const {
  analyzeArchitectureSource,
  formatArchitectureViolation,
} = require('../../scripts/check-architecture');

function codes(source, file) {
  return analyzeArchitectureSource(source, file).map((violation) => violation.code);
}

test('step definitions cannot import Playwright or locators directly', () => {
  const violations = analyzeArchitectureSource(
    `
      import { expect } from '@playwright/test';
      import { locators } from '../../src/locators/locators';
    `,
    'features/step-definitions/example.steps.ts',
  );

  assert.deepEqual(
    violations.map((violation) => violation.code),
    ['step-playwright-import', 'step-locator-import'],
  );
  assert.equal(violations[0].line, 2);
  assert.equal(violations[0].file, 'features/step-definitions/example.steps.ts');
});

test('step definitions cannot use raw Page or locator APIs', () => {
  const source = `
    const current = getPage(this);
    await current.goto('/example');
    await page.keyboard.press('Escape');
    await locator.click();
    await page.locator('#id').click();
    await page.getByRole('button').click();
    await page.getByText('text').click();
    await page.getByLabel('label').fill('value');
    await page.getByPlaceholder('placeholder').fill('value');
  `;
  const violations = analyzeArchitectureSource(
    source,
    'features/step-definitions/example.steps.ts',
  );

  assert.equal(violations.filter((item) => item.code === 'step-raw-playwright').length, 8);
});

test('actions cannot import or call Playwright expect, including an aliased import', () => {
  const source = `
    import { expect as playwrightExpect } from '@playwright/test';
    await playwrightExpect(locator).toBeVisible();
  `;

  assert.deepEqual(codes(source, 'src/actions/example.actions.ts'), [
    'action-expect-import',
    'action-expect-call',
  ]);
});

test('actions cannot call expect through a Playwright namespace import', () => {
  const source = `
    import * as playwright from '@playwright/test';
    await playwright.expect.soft(locator).toBeVisible();
  `;

  assert.deepEqual(codes(source, 'src/actions/example.actions.ts'), ['action-expect-call']);
});

test('assertions cannot perform mutating UI operations', () => {
  const methods = [
    'click',
    'fill',
    'press',
    'selectOption',
    'hover',
    'check',
    'uncheck',
    'setInputFiles',
    'dragTo',
  ];
  const source = methods.map((method) => `await locator.${method}();`).join('\n');
  const violations = analyzeArchitectureSource(source, 'src/assertions/example.assertions.ts');

  assert.equal(violations.length, methods.length);
  assert.ok(violations.every((violation) => violation.code === 'assertion-mutation'));
});

test('waitForTimeout and Page Object structures are forbidden', () => {
  assert.deepEqual(codes('await page.waitForTimeout(1000);', 'src/flows/example.flow.ts'), [
    'wait-for-timeout',
  ]);
  assert.deepEqual(codes('export class LoginPage {}', 'src/services/login.ts'), [
    'page-object-class',
  ]);
  assert.deepEqual(codes('export const value = 1;', 'src/pages/login.ts'), [
    'page-object-directory',
  ]);
});

test('valid layered code and matching text in comments or strings remain clean', () => {
  const source = `
    import { When } from '@cucumber/cucumber';
    import { clickButtonByName } from '../../src/actions/control.actions';
    import { CustomWorld, getPage } from '../support/world';

    // page.getByRole('button') and page.waitForTimeout(1000) are documentation only.
    const documentation = "locator.click()";
    When('{string} butonuna tiklanir', async function (this: CustomWorld, name: string) {
      await clickButtonByName(getPage(this), name);
    });
  `;

  assert.deepEqual(codes(source, 'features/step-definitions/common.steps.ts'), []);
});

test('violation formatting includes a clickable source position and rule code', () => {
  const [violation] = analyzeArchitectureSource(
    'await locator.click();',
    'src/assertions/example.assertions.ts',
  );

  assert.equal(
    formatArchitectureViolation(violation),
    'src/assertions/example.assertions.ts:1:7 [assertion-mutation] Assertions must not perform mutating UI operation "click".',
  );
});
