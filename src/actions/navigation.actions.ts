import { Locator, Page } from '@playwright/test';
import { resolveUiTimeout, TimeoutOptions } from '../config/timeouts';
import { LocatorReport } from '../utils/action-report';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { click } from './common.actions';

async function isVisible(locator: Locator) {
  return (await locator.filter({ visible: true }).count()) > 0;
}

function isMenuOpenRetryableError(error: unknown) {
  return (
    error instanceof Error &&
    (error.message.includes('not attached to the DOM') || error.message.includes('Timeout'))
  );
}

async function openMenuIfChildHidden(
  menuButton: Locator,
  childLocator: Locator,
  menuButtonReport: LocatorReport,
  deadline: number,
  configuredTimeout: number,
) {
  if (await isVisible(childLocator)) {
    return;
  }

  let lastError: unknown;

  const remainingTimeout = () => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      throw new Error(`Sidebar menu acma islemi ${configuredTimeout} ms icinde tamamlanamadi.`);
    }

    return remaining;
  };

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const visibleMenuButton = menuButton.filter({ visible: true }).first();
      await visibleMenuButton.waitFor({
        state: 'visible',
        timeout: remainingTimeout(),
      });
      await visibleMenuButton.scrollIntoViewIfNeeded({ timeout: remainingTimeout() });

      const expandButton = visibleMenuButton.locator('button[aria-expanded]').first();
      if ((await expandButton.count()) > 0) {
        const isExpanded = await expandButton.getAttribute('aria-expanded', {
          timeout: remainingTimeout(),
        });
        if (isExpanded !== 'true') {
          await click(expandButton, menuButtonReport, {
            timeout: remainingTimeout(),
          });
        }
      } else {
        await click(visibleMenuButton, menuButtonReport, {
          timeout: remainingTimeout(),
        });
      }

      await childLocator.filter({ visible: true }).first().waitFor({
        state: 'visible',
        timeout: remainingTimeout(),
      });
      return;
    } catch (error) {
      lastError = error;

      if (await isVisible(childLocator)) {
        return;
      }

      if (!isMenuOpenRetryableError(error)) {
        throw error;
      }

      if (Date.now() >= deadline) {
        break;
      }
    }
  }

  throw (
    lastError ?? new Error(`Sidebar menu acma islemi ${configuredTimeout} ms icinde tamamlanamadi.`)
  );
}

export async function openSidebarMenuPath(
  page: Page,
  parentMenuNames: readonly string[],
  targetLinkName: string,
  options: TimeoutOptions = {},
) {
  const locator = locators(page);
  const timeout = resolveUiTimeout(options);
  const deadline = Date.now() + timeout;

  for (let index = 0; index < parentMenuNames.length; index += 1) {
    const parentMenuName = parentMenuNames[index];
    const childMenuName = parentMenuNames[index + 1];
    const childLocator = childMenuName
      ? locator.navigation.sidebarMenuButton(childMenuName)
      : locator.navigation.sidebarMenuLink(targetLinkName);

    await openMenuIfChildHidden(
      locator.navigation.sidebarMenuButton(parentMenuName),
      childLocator,
      LOCATOR_REPORTS.navigation.sidebarMenuButton(parentMenuName),
      deadline,
      timeout,
    );
  }
}

export async function clickSidebarMenuLink(page: Page, name: string, options: TimeoutOptions = {}) {
  const locator = locators(page);

  await click(
    locator.navigation.sidebarMenuLink(name).filter({ visible: true }).first(),
    LOCATOR_REPORTS.navigation.sidebarMenuLink(name),
    { timeout: resolveUiTimeout(options) },
  );
}
