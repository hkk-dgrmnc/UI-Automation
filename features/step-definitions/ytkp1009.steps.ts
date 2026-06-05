import { Then } from '@cucumber/cucumber';
import { Page } from '@playwright/test';
import {
  verifyYtkp1009Tc001V1,
  verifyYtkp1009Tc001V2,
} from '../../src/flows/ytkp1009.flow';
import { CustomWorld } from '../support/world';

function getPage(world: CustomWorld): Page {
  if (!world.page) {
    throw new Error('Playwright page is not initialized.');
  }

  return world.page;
}

Then('TC-001 - v1 - Otomatik Parametre Tanımlama ekranı açılış kontrolü', async function (this: CustomWorld) {
  await verifyYtkp1009Tc001V1(getPage(this));
});

Then('TC-001 - v2 - Otomatik Parametre Tanımlama ekranı açılış kontrolü', async function (this: CustomWorld) {
  await verifyYtkp1009Tc001V2(getPage(this));
});
