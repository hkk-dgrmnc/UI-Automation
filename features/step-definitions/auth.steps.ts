import { Given, Then, When } from '@cucumber/cucumber';
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

Given('Login ekranı açılır', async function (this: CustomWorld) {
  await openLoginPage(getPage(this));
});

When('Kullanıcı bilgileri ile giriş yapılır', async function (this: CustomWorld) {
  await submitLogin(getPage(this), users.validUser);
});

Then('Kullanıcının login oldugu dogrulanır', async function (this: CustomWorld) {
  await verifyLoginSuccess(getPage(this));
});
