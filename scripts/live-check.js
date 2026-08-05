require('dotenv/config');
require('ts-node/register');

const { chromium, firefox, webkit } = require('@playwright/test');
const { env } = require('../src/config/env');
const { TIMEOUTS } = require('../src/config/timeouts');
const { getUser } = require('../src/data/data');
const { openSidebarMenuPath, clickSidebarMenuLink } = require('../src/actions/navigation.actions');
const { expectHeadingVisible, expectVisible } = require('../src/assertions/common.assertions');
const { expectButtonVisible } = require('../src/assertions/control.assertions');
const { expectInputFieldsVisible } = require('../src/assertions/form.assertions');
const { expectTableColumnHeadersVisible } = require('../src/assertions/table.assertions');
const { LOCATOR_REPORTS, locators } = require('../src/locators/locators');
const { runBestEffort } = require('../src/utils/best-effort');

const browserTypes = { chromium, firefox, webkit };

function printUsageAndExit(exitCode = 2) {
  console.error(
    [
      'Usage:',
      '  node scripts/live-check.js --menu "Ust > Sayfa" [--user USER1] [--heading "Baslik"] [--columns "Kod,Hesap Adi"]',
      '',
      'Options:',
      '  --user USER1                 .env user block. Default: USER1',
      '  --browser chromium           chromium | firefox | webkit. Default: chromium',
      '  --headed                     Run browser headed',
      '  --menu "A > B > Page"        Sidebar menu path to open',
      '  --selected "Page"            Selected sidebar text to verify. Default: last menu path item',
      '  --heading "Heading"          Heading to verify. Repeatable',
      '  --columns "A,B,C"            Table column headers to verify',
      '  --inputs "A,B,C"             Input labels to verify',
      '  --button "Save"              Button to verify. Repeatable',
      `  --timeout-ms ${TIMEOUTS.uiOperation}           Default: ${TIMEOUTS.uiOperation}`,
    ].join('\n'),
  );
  process.exit(exitCode);
}

function pushCsv(target, value) {
  if (!value) return;
  for (const item of value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)) {
    target.push(item);
  }
}

function parseArgs(argv) {
  const args = {
    browser: process.env.BROWSER ?? 'chromium',
    buttons: [],
    columns: [],
    headed: process.env.HEADED === 'true',
    headings: [],
    inputs: [],
    menu: undefined,
    selected: undefined,
    timeoutMs: TIMEOUTS.uiOperation,
    user: 'USER1',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--browser') {
      args.browser = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === '--button') {
      args.buttons.push(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--columns') {
      pushCsv(args.columns, argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--headed') {
      args.headed = true;
      continue;
    }

    if (arg === '--heading') {
      args.headings.push(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--inputs') {
      pushCsv(args.inputs, argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--menu') {
      args.menu = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === '--selected') {
      args.selected = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === '--timeout-ms') {
      args.timeoutMs = Number(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--user') {
      args.user = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      printUsageAndExit(0);
    }

    console.error(`Unknown argument: ${arg}`);
    printUsageAndExit();
  }

  if (!browserTypes[args.browser]) {
    console.error(`Unsupported browser: ${args.browser}`);
    printUsageAndExit();
  }

  if (!Number.isFinite(args.timeoutMs) || args.timeoutMs <= 0) {
    console.error('--timeout-ms must be a positive number.');
    printUsageAndExit();
  }

  return args;
}

async function login(page, userKey, timeoutMs) {
  const user = getUser(userKey);
  const locator = locators(page);

  await page.goto(env.baseUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs });

  const firstVisible = await Promise.any([
    locator.auth.userProfileButton
      .waitFor({ state: 'visible', timeout: timeoutMs })
      .then(() => 'profile'),
    locator.auth.usernameInput
      .waitFor({ state: 'visible', timeout: timeoutMs })
      .then(() => 'login'),
  ]).catch(() => {
    throw new Error('Login formu veya kullanici profil butonu gorunmedi.');
  });

  if (firstVisible === 'login') {
    await locator.auth.usernameInput.fill(user.username, { timeout: timeoutMs });
    await locator.auth.passwordInput.waitFor({ state: 'visible', timeout: timeoutMs });
    await locator.auth.passwordInput.fill(user.password, { timeout: timeoutMs });
    await locator.auth.loginButton.click({ timeout: timeoutMs });
  }

  await expectVisible(locator.auth.userProfileButton, LOCATOR_REPORTS.auth.userProfileButton, {
    timeout: timeoutMs,
  });
}

async function openMenuPath(page, menuPath, timeoutMs) {
  if (!menuPath) {
    return undefined;
  }

  const parts = menuPath
    .split(' > ')
    .map((part) => part.trim())
    .filter(Boolean);
  const linkName = parts[parts.length - 1];
  const parentNames = parts.slice(0, -1);

  const options = { timeout: timeoutMs };
  await openSidebarMenuPath(page, parentNames, linkName, options);
  await clickSidebarMenuLink(page, linkName, options);

  return linkName;
}

function routeHint(url) {
  try {
    const parsed = new URL(url);
    return parsed.hash || parsed.pathname;
  } catch {
    return url;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const browser = await browserTypes[args.browser].launch({
    headless: !args.headed,
    ...(args.headed && args.browser === 'chromium' ? { args: ['--start-maximized'] } : {}),
  });

  let context;
  let page;
  let hasPrimaryError = false;
  let primaryError;

  try {
    context = await browser.newContext({
      ignoreHTTPSErrors: true,
      ...(args.headed ? { viewport: null } : {}),
    });
    page = await context.newPage();
    page.setDefaultTimeout(args.timeoutMs);
    page.setDefaultNavigationTimeout(args.timeoutMs);

    await login(page, args.user, args.timeoutMs);

    const openedLinkName = await openMenuPath(page, args.menu, args.timeoutMs);
    const selectedName = args.selected ?? openedLinkName;
    if (selectedName) {
      await expectVisible(
        locators(page).navigation.selectedSidebarMenuLink(selectedName),
        LOCATOR_REPORTS.navigation.selectedSidebarMenuLink(selectedName),
        { timeout: args.timeoutMs },
      );
    }

    for (const heading of args.headings) {
      await expectHeadingVisible(page, heading, { timeout: args.timeoutMs });
    }

    if (args.columns.length > 0) {
      await expectTableColumnHeadersVisible(page, args.columns, { timeout: args.timeoutMs });
    }

    if (args.inputs.length > 0) {
      await expectInputFieldsVisible(page, args.inputs, { timeout: args.timeoutMs });
    }

    for (const button of args.buttons) {
      await expectButtonVisible(page, button, { timeout: args.timeoutMs });
    }

    console.log(
      [
        'Live check passed.',
        `User: ${args.user}`,
        `Route: ${routeHint(page.url())}`,
        selectedName ? `Selected menu: ${selectedName}` : undefined,
        args.headings.length ? `Headings: ${args.headings.join(', ')}` : undefined,
        args.columns.length ? `Columns: ${args.columns.join(', ')}` : undefined,
        args.inputs.length ? `Inputs: ${args.inputs.join(', ')}` : undefined,
        args.buttons.length ? `Buttons: ${args.buttons.join(', ')}` : undefined,
      ]
        .filter(Boolean)
        .join('\n'),
    );
  } catch (error) {
    hasPrimaryError = true;
    primaryError = error;
  }

  const cleanupFailures = [];
  for (const [operation, callback] of [
    ...(context ? [['Close Playwright browser context', () => context.close()]] : []),
    ['Close Playwright browser', () => browser.close()],
  ]) {
    const failure = await runBestEffort(operation, callback);
    if (failure) cleanupFailures.push(failure);
  }

  if (hasPrimaryError) {
    throw primaryError;
  }

  if (cleanupFailures.length > 0) {
    throw new AggregateError(
      cleanupFailures.map(({ error }) => error),
      `Live check teardown failed: ${cleanupFailures.map(({ operation }) => operation).join(', ')}`,
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
