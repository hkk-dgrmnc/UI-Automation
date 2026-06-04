import {
  IWorldOptions,
  World,
  setWorldConstructor,
} from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';

export type BrowserName = 'chromium' | 'firefox' | 'webkit';

export type TestWorldParameters = {
  browser?: BrowserName;
  headed?: boolean;
  slowMo?: number;
};

export class CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);
