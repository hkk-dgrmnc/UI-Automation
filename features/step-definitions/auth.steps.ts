import { defineStep as Step } from '@cucumber/cucumber';
import { Page } from '@playwright/test';
import { users } from '../../src/data/data';
import {
  openLoginPage,
  submitLogin,
  verifyLoginSuccess,
} from '../../src/flows/auth.flow';
import { CustomWorld } from '../support/world';

function getPage(world: CustomWorld): Page {
  if (!world.page) {
    throw new Error('Playwright page is not initialized.');
  }

  return world.page;
}

Step('kullanici login ekranini acar', async function (this: CustomWorld) {
  await openLoginPage(getPage(this));
});

Step('Kullanici gecerli bilgilerle giris yapar', async function (this: CustomWorld) {
  await submitLogin(getPage(this), users.validUser);
});

Step('kullanici basarili sekilde login olur', async function (this: CustomWorld) {
  await verifyLoginSuccess(getPage(this));
});
