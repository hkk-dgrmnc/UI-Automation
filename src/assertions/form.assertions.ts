import { Page, expect } from '@playwright/test';
import { resolveUiTimeout } from '../config/timeouts';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { reportAssertion, reportError } from '../utils/action-report';
import { AssertionOptions, expectHasValue, expectVisible } from './common.assertions';

export async function expectInputFieldsVisible(
  page: Page,
  expectedFields: readonly string[],
  options: AssertionOptions = {},
) {
  const locator = locators(page);

  for (const field of expectedFields) {
    await expectVisible(
      locator.common.inputField(field),
      LOCATOR_REPORTS.common.inputField(field),
      options,
    );
  }
}

export async function expectInputFieldValue(
  page: Page,
  fieldName: string,
  expectedValue: string,
  options: AssertionOptions = {},
) {
  const locator = locators(page);

  await expectHasValue(
    locator.common.inputField(fieldName),
    LOCATOR_REPORTS.common.inputField(fieldName),
    expectedValue,
    `"${expectedValue}" degeri yazili`,
    options,
  );
}

export async function expectInputFieldValueLengthLessThanOrEqual(
  page: Page,
  fieldName: string,
  maxLength: number,
  options: AssertionOptions = {},
) {
  const locator = locators(page);
  const input = locator.common.inputField(fieldName);
  const report = LOCATOR_REPORTS.common.inputField(fieldName);

  reportAssertion({
    assertion: 'To Have Value Length Less Than Or Equal',
    locatorName: report.name,
    locatorValue: report.value,
    expected: `girilen karakter sayisi <= ${maxLength}`,
  });
  try {
    await expect
      .poll(
        async () => {
          const value = await input.inputValue({ timeout: resolveUiTimeout(options) });
          return Array.from(value).length;
        },
        { timeout: resolveUiTimeout(options) },
      )
      .toBeLessThanOrEqual(maxLength);
  } catch (error) {
    reportError({
      action: 'To Have Value Length Less Than Or Equal',
      locatorName: report.name,
      error,
    });
    throw error;
  }
}
