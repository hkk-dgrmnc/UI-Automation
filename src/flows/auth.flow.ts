import { Page } from '@playwright/test';
import {
  clickLoginButton,
  fillLoginPassword,
  fillLoginUsername,
} from '../actions/auth.actions';
import { expectLoginPageVisible, expectLoginSuccess } from '../assertions/auth.assertions';
import { env } from '../config/env';
import { TestUser } from '../data/data';

export async function openLoginPage(page: Page) {
  await page.goto(env.baseUrl);

  await expectLoginPageVisible(page);
}

export async function submitLogin(page: Page, user: TestUser) {
  await fillLoginUsername(page, user.username);
  await fillLoginPassword(page, user.password);
  await clickLoginButton(page);
}

export async function verifyLoginSuccess(page: Page) {
  await expectLoginSuccess(page);
}

export async function login(page: Page, user: TestUser) {
  await openLoginPage(page);
  await submitLogin(page, user);
  await verifyLoginSuccess(page);
}
