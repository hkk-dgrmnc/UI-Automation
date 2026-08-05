import 'dotenv/config';
import { After, Before, BeforeStep, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, firefox, webkit } from '@playwright/test';
import { TIMEOUTS } from '../../src/config/timeouts';
import { runBestEffort, SecondaryFailure } from '../../src/utils/best-effort';
import { COLORS as C } from '../../src/utils/console-format';
import { BrowserName, CustomWorld, TestWorldParameters } from './world';

const browserTypes = {
  chromium,
  firefox,
  webkit,
} as const;

setDefaultTimeout(TIMEOUTS.cucumberStep);

function getWorldParameters(world: CustomWorld) {
  return world.parameters as TestWorldParameters;
}

function getBrowserName(world: CustomWorld): BrowserName {
  const parameters = getWorldParameters(world);
  const browserName = parameters.browser ?? process.env.BROWSER ?? 'chromium';

  if (browserName !== 'chromium' && browserName !== 'firefox' && browserName !== 'webkit') {
    throw new Error(`Unsupported browser: ${browserName}`);
  }

  return browserName;
}

Before(async function (this: CustomWorld, scenario) {
  console.log(`\n${C.bold}${C.yellow}  ◆  ${scenario.pickle.name}${C.reset}`);

  const parameters = getWorldParameters(this);
  const browserName = getBrowserName(this);
  const headed = parameters.headed === true || process.env.HEADED === 'true';

  const launchOptions = {
    headless: !headed,
    slowMo: parameters.slowMo ?? 0,
    ...(headed && browserName === 'chromium' ? { args: ['--start-maximized'] } : {}),
  };

  this.browser = await browserTypes[browserName].launch(launchOptions);

  const contextOptions = {
    ignoreHTTPSErrors: true,
    ...(headed ? { viewport: null } : {}),
  };

  this.context = await this.browser.newContext(contextOptions);
  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(TIMEOUTS.uiOperation);
  this.page.setDefaultNavigationTimeout(TIMEOUTS.uiOperation);
});

BeforeStep(function (step) {
  console.log(`\n    ${C.bold}${C.white}►  ${step.pickleStep.text}${C.reset}`);
});

After(async function (this: CustomWorld, scenario) {
  const page = this.page;
  const context = this.context;
  const browser = this.browser;
  const secondaryFailures: SecondaryFailure[] = [];

  const attempt = async (operation: string, callback: () => unknown | Promise<unknown>) => {
    const failure = await runBestEffort(operation, callback);
    if (failure) {
      secondaryFailures.push(failure);
    }

    return failure;
  };

  try {
    if (scenario.result?.status === Status.FAILED && page) {
      let screenshot: Buffer | undefined;
      const screenshotFailure = await attempt('Capture failure screenshot', async () => {
        screenshot = await page.screenshot({ fullPage: true });
      });

      if (!screenshotFailure && screenshot) {
        await attempt('Attach failure screenshot', () =>
          this.attach(screenshot as Buffer, 'image/png'),
        );
      }
    }
  } finally {
    if (context) {
      await attempt('Close Playwright browser context', () => context.close());
    }

    if (browser) {
      await attempt('Close Playwright browser', () => browser.close());
    }

    this.page = undefined;
    this.context = undefined;
    this.browser = undefined;
  }

  const scenarioAlreadyUnsuccessful = scenario.result?.status !== Status.PASSED;
  if (!scenarioAlreadyUnsuccessful && secondaryFailures.length > 0) {
    throw new AggregateError(
      secondaryFailures.map(({ error }) => error),
      `Playwright teardown failed: ${secondaryFailures.map(({ operation }) => operation).join(', ')}`,
    );
  }
});
