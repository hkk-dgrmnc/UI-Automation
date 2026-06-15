import { World, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { ScenarioStore } from './scenario-store';

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

  /** Senaryo boyunca isimle saklanan runtime degerler (orn. secilen dropdown degeri). */
  readonly store = new ScenarioStore();
}

export function getPage(world: CustomWorld): Page {
  if (!world.page) {
    throw new Error('Playwright page is not initialized.');
  }

  return world.page;
}

setWorldConstructor(CustomWorld);
