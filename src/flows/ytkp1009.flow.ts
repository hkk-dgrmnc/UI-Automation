import { Page } from '@playwright/test';
import {
  clickCreateLink,
  clickSidebarMenuLink,
  openSidebarMenuPath,
} from '../actions/actions';
import {
  expectAutomaticParametersCreatePageOpened,
  expectAutomaticParametersCreateLinkAvailable,
  expectAutomaticParametersRouteOpened,
} from '../assertions/assertions';

const automaticParametersMenu = {
  parentPath: ['MFYS', 'Genel Parametre Ayarları', 'Tanımlama İşlemleri'],
  linkName: 'Otomatik Parametre Tanımlama',
} as const;

export async function verifyYtkp1009Tc001V1(page: Page) {
  await openSidebarMenuPath(
    page,
    automaticParametersMenu.parentPath,
    automaticParametersMenu.linkName,
  );
  await clickSidebarMenuLink(page, automaticParametersMenu.linkName);
  await expectAutomaticParametersRouteOpened(page);
}

export async function verifyYtkp1009Tc001V2(page: Page) {
  await expectAutomaticParametersCreateLinkAvailable(page);
  await clickCreateLink(page);
  await expectAutomaticParametersCreatePageOpened(page);
}
