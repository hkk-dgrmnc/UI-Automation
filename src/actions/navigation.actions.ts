import { Locator, Page } from '@playwright/test';
import { LocatorReport } from '../utils/action-report';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { click } from './common.actions';

async function isVisible(locator: Locator) {
  return (await locator.filter({ visible: true }).count()) > 0;
}

function isMenuOpenRetryableError(error: unknown) {
  return error instanceof Error && (
    error.message.includes('not attached to the DOM') ||
    error.message.includes('Timeout')
  );
}

async function openMenuIfChildHidden(
  menuButton: Locator,
  childLocator: Locator,
  menuButtonReport: LocatorReport,
) {
  if (await isVisible(childLocator)) {
    return;
  }

  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const visibleMenuButton = menuButton.filter({ visible: true }).first();
      await visibleMenuButton.waitFor({ state: 'visible', timeout: 10_000 });
      await visibleMenuButton.scrollIntoViewIfNeeded();

      const expandButton = visibleMenuButton.locator('button[aria-expanded]').first();
      if (await expandButton.count() > 0) {
        const isExpanded = await expandButton.getAttribute('aria-expanded');
        if (isExpanded !== 'true') {
          await click(expandButton, menuButtonReport, { timeout: 10_000 });
        }
      } else {
        await click(visibleMenuButton, menuButtonReport, { timeout: 10_000 });
      }

      await childLocator.filter({ visible: true }).first().waitFor({
        state: 'visible',
        timeout: 10_000,
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
    }
  }

  throw lastError;
}

export async function openSidebarMenuPath(
  page: Page,
  parentMenuNames: readonly string[],
  targetLinkName: string,
) {
  const locator = locators(page);

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
    );
  }
}

export async function clickSidebarMenuLink(page: Page, name: string) {
  const locator = locators(page);

  await click(
    locator.navigation.sidebarMenuLink(name).filter({ visible: true }).first(),
    LOCATOR_REPORTS.navigation.sidebarMenuLink(name),
  );
}
