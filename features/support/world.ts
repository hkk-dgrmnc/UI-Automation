import { World, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { reportValue } from '../../src/utils/action-report';
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

  /** Bir degeri isimle saklar ve rapora/console'a SAVE olarak yazar. */
  saveValue(name: string, value: unknown): void {
    this.store.save(name, value);
    reportValue({ event: 'SAVE', name, value });
  }

  /** Saklanan degeri okur ve rapora/console'a USE olarak yazar (yoksa hata firlatir). */
  getValue<T = string>(name: string): T {
    const value = this.store.get<T>(name);
    reportValue({ event: 'USE', name, value });
    return value;
  }
}

export function getPage(world: CustomWorld): Page {
  if (!world.page) {
    throw new Error('Playwright page is not initialized.');
  }

  return world.page;
}

setWorldConstructor(CustomWorld);
