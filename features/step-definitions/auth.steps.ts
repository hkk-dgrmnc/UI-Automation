import { Given, Then, When } from '@cucumber/cucumber';
import { users } from '../../src/data/data';
import {
  login,
  openLoginPage,
  submitLogin,
  verifyLoginSuccess,
} from '../../src/flows/auth.flow';
import { CustomWorld, getPage } from '../support/world';

Given('Login ekranı açılır', async function (this: CustomWorld) {
  await openLoginPage(getPage(this));
});

Given('Kullanıcı login olur', async function (this: CustomWorld) {
  await login(getPage(this), users.validUser);
});

When('Kullanıcı bilgileri ile giriş yapılır', async function (this: CustomWorld) {
  await submitLogin(getPage(this), users.validUser);
});

Then('Kullanıcının login oldugu dogrulanır', async function (this: CustomWorld) {
  await verifyLoginSuccess(getPage(this));
});
