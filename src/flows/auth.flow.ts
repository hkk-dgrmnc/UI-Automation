import { Page } from '@playwright/test';
import {
  clickLoginButton,
  fillLoginPassword,
  fillLoginUsername,
} from '../actions/actions';
import { expectLoginPageVisible, expectLoginSuccess } from '../assertions/assertions';
import { env } from '../config/env';
import { TestUser, users } from '../data/data';

export function getLoginUsername(user: TestUser) {
  const username = user.username || user.email;

  if (!username) {
    throw new Error('VALID_USER_USERNAME or VALID_USER_EMAIL must be set.');
  }

  return username;
}

function getLoginPassword(user: TestUser) {
  if (!user.password) {
    throw new Error('VALID_USER_PASSWORD must be set.');
  }

  return user.password;
}

export async function openLoginPage(page: Page) {
  await page.goto(env.baseUrl);

  await expectLoginPageVisible(page);
}

export async function submitLogin(page: Page, user: TestUser = users.validUser) {
  await fillLoginUsername(page, getLoginUsername(user));
  await fillLoginPassword(page, getLoginPassword(user));
  await clickLoginButton(page);
}

export async function verifyLoginSuccess(page: Page) {
  await expectLoginSuccess(page);
}

export async function login(page: Page, user: TestUser = users.validUser) {
  await openLoginPage(page);
  await submitLogin(page, user);
  await verifyLoginSuccess(page);
}
