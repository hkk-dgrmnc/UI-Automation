import 'dotenv/config';
import { After, Before, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, firefox, webkit } from '@playwright/test';
import {
  BrowserName,
  CustomWorld,
  TestWorldParameters,
} from './world';

const browserTypes = {
  chromium,
  firefox,
  webkit,
} as const;

setDefaultTimeout(90_000);

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

Before(async function (this: CustomWorld) {
  const parameters = getWorldParameters(this);
  const browserName = getBrowserName(this);
  const headed = parameters.headed === true || process.env.HEADED === 'true';

  this.browser = await browserTypes[browserName].launch({
    headless: !headed,
    slowMo: parameters.slowMo ?? 0,
  });

  this.context = await this.browser.newContext({
    ignoreHTTPSErrors: true,
  });
  this.page = await this.context.newPage();
});

After(async function (this: CustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    const screenshot = await this.page.screenshot({ fullPage: true });
    await this.attach(screenshot, 'image/png');
  }

  await this.context?.close();
  await this.browser?.close();
});
