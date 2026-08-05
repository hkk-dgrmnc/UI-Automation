import { errors, Page } from '@playwright/test';
import { TIMEOUTS } from '../config/timeouts';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { reportAssertion, reportError } from '../utils/action-report';
import { expectNotVisible, expectUrl, expectVisible } from './common.assertions';

async function expectStableHealthyLoginLanding(page: Page) {
  const locator = locators(page);
  const report = LOCATOR_REPORTS.auth.fatalLoginError;

  reportAssertion({
    assertion: 'Not To Become Visible During Login Landing',
    locatorName: report.name,
    locatorValue: report.value,
    expected: `${TIMEOUTS.loginLandingStability} ms boyunca fatal login hatasi gorunmez`,
  });

  try {
    await locator.auth.fatalLoginError.waitFor({
      state: 'visible',
      timeout: TIMEOUTS.loginLandingStability,
    });
  } catch (error) {
    if (error instanceof errors.TimeoutError) {
      return;
    }

    reportError({
      action: 'Not To Become Visible During Login Landing',
      locatorName: report.name,
      error,
    });
    throw error;
  }

  const visibleFatalTexts = await locator.auth.fatalLoginError.allTextContents();
  const fatalText = visibleFatalTexts[0]?.trim() || 'fatal login hata indikatoru';
  const fatalError = new Error(`Login landing ekrani fatal hata gosterdi: "${fatalText}".`);

  reportError({
    action: 'Not To Become Visible During Login Landing',
    locatorName: report.name,
    error: fatalError,
  });
  throw fatalError;
}

export async function expectLoginPageVisible(page: Page) {
  const locator = locators(page);

  await expectVisible(locator.auth.usernameInput, LOCATOR_REPORTS.auth.usernameInput);
  await expectVisible(locator.auth.passwordInput, LOCATOR_REPORTS.auth.passwordInput);
  await expectVisible(locator.auth.loginButton, LOCATOR_REPORTS.auth.loginButton);
}

export async function expectAuthenticationSuccess(page: Page) {
  const locator = locators(page);

  await expectUrl(page, /shell-app-ui\/#\/journal-audits/);
  await expectNotVisible(locator.auth.usernameInput, LOCATOR_REPORTS.auth.usernameInput);
  await expectVisible(locator.auth.userProfileButton, LOCATOR_REPORTS.auth.userProfileButton, {
    timeout: TIMEOUTS.uiOperation,
  });
}

export async function expectLoginSuccess(page: Page) {
  const locator = locators(page);

  await expectAuthenticationSuccess(page);
  await expectStableHealthyLoginLanding(page);
  await expectVisible(locator.auth.userProfileButton, LOCATOR_REPORTS.auth.userProfileButton, {
    timeout: TIMEOUTS.uiOperation,
  });
}
