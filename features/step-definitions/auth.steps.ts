import { Given, Then, When } from '@cucumber/cucumber';
import { getUser } from '../../src/data/data';
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

Given('{string} kullanıcısı ile login olunur', async function (this: CustomWorld, username: string) {
  await login(getPage(this), getUser(username));
});

When('{string} kullanıcısı bilgileri ile giriş yapılır', async function (this: CustomWorld, username: string) {
  await submitLogin(getPage(this), getUser(username));
});

Then('Kullanıcının login oldugu dogrulanır', async function (this: CustomWorld) {
  await verifyLoginSuccess(getPage(this));
});
