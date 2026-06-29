import { Locator, Page } from '@playwright/test';
import { LocatorReport, reportAction, reportError } from '../utils/action-report';
import { LOCATOR_REPORTS, locators } from '../locators/locators';
import { resolveTableColumnPosition } from '../utils/table';

export type ClickOptions = {
  timeout?: number;
};

export type VisibleBusinessTextAudit = {
  route: string;
  scope: string;
  lines: string[];
};

// Raporlama bu projede her reusable wrapper'in varsayilan davranisidir; isim
// "ne yaptigini" soyler, "raporladigini" degil. Bu yuzden suffix yok: fill/click.
// Bu iki primitive tum domain action dosyalari tarafindan kullanilir; yeni domain
// action dosyasi bunlari buradan import eder (kendi kopyasini yazmaz).
export async function fill(
  locator: Locator,
  locatorReport: LocatorReport,
  value: string,
  maskValue = false,
) {
  reportAction({
    action: 'Fill',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
    value,
    maskValue,
  });
  try {
    await locator.fill(value);
  } catch (error) {
    reportError({ action: 'Fill', locatorName: locatorReport.name, error });
    throw error;
  }
}

export async function click(
  locator: Locator,
  locatorReport: LocatorReport,
  options: ClickOptions = {},
) {
  reportAction({
    action: 'Click',
    locatorName: locatorReport.name,
    locatorValue: locatorReport.value,
  });
  try {
    await locator.click(options);
  } catch (error) {
    reportError({ action: 'Click', locatorName: locatorReport.name, error });
    throw error;
  }
}

export async function clickButtonByName(page: Page, name: string) {
  const locator = locators(page);

  await click(
    locator.common.clickableControl(name).filter({ visible: true }).first(),
    LOCATOR_REPORTS.common.clickableControl(name),
  );
}

export async function fillInputFieldByName(page: Page, fieldName: string, value: string) {
  const locator = locators(page);

  await fillElement(
    locator.common.inputField(fieldName),
    LOCATOR_REPORTS.common.inputField(fieldName),
    value,
  );
}

export async function clickTableColumnValue(page: Page, columnName: string, value: string) {
  const locator = locators(page);
  let columnPosition: number;

  try {
    columnPosition = await resolveTableColumnPosition(page, columnName);
  } catch (error) {
    reportError({
      action: 'Resolve table column position',
      locatorName: LOCATOR_REPORTS.common.tableColumnHeader(columnName).name,
      error,
    });
    throw error;
  }

  await click(
    locator.common.tableColumnCell(columnName, value, columnPosition),
    LOCATOR_REPORTS.common.tableColumnCell(columnName, value, columnPosition),
  );
}

export async function openDropdown(page: Page, name: string) {
  const locator = locators(page);

  if (await page.getByRole('listbox').count() > 0) {
    await page.keyboard.press('Escape');
  }

  await click(
    locator.common.dropdownCombobox(name),
    LOCATOR_REPORTS.common.dropdownCombobox(name),
  );
}

export async function selectDropdownOption(page: Page, dropdownName: string, optionText: string) {
  const locator = locators(page);

  await openDropdown(page, dropdownName);
  await click(
    locator.common.listboxOption(optionText),
    LOCATOR_REPORTS.common.listboxOption(optionText),
  );
}

// --- Dinamik deger: oku / yaz / metne gore tikla ----------------------------
// Bu fonksiyonlar ScenarioStore'dan bagimsizdir: deger alir veya dondurur.
// Store'a saklama/okuma step katmaninda `this.saveValue/getValue` ile yapilir
// (AGENTS.md 12.1). Boylece ayni fonksiyonlar literal degerle de kullanilabilir.

type TextMatchOptions = {
  /** true: metin verilen degere ESIT olmali; false: ICERMELI. Varsayilan true. */
  exact?: boolean;
};

/** Verilen elementin gorunur metnini okur, raporlar ve dondurur (store'a yazmaz). */
export async function readElementText(
  locator: Locator,
  locatorReport: LocatorReport,
): Promise<string> {
  try {
    const text = (await locator.innerText()).trim();
    reportAction({
      action: 'Read text',
      locatorName: locatorReport.name,
      locatorValue: locatorReport.value,
      value: text,
    });
    return text;
  } catch (error) {
    reportError({ action: 'Read text', locatorName: locatorReport.name, error });
    throw error;
  }
}

/** Verilen elementin bir attribute degerini okur, raporlar ve dondurur (store'a yazmaz). */
export async function readElementAttribute(
  locator: Locator,
  locatorReport: LocatorReport,
  attribute: string,
): Promise<string> {
  try {
    const value = await locator.getAttribute(attribute);
    if (value === null) {
      throw new Error(`"${locatorReport.name}" elementinde "${attribute}" attribute'u yok.`);
    }
    reportAction({
      action: `Read @${attribute}`,
      locatorName: locatorReport.name,
      locatorValue: locatorReport.value,
      value,
    });
    return value;
  } catch (error) {
    reportError({ action: `Read @${attribute}`, locatorName: locatorReport.name, error });
    throw error;
  }
}

/** Verilen elemana verilen degeri yazar (deger store'dan da gelebilir). */
export async function fillElement(
  locator: Locator,
  locatorReport: LocatorReport,
  value: string,
  maskValue = false,
) {
  await fill(locator, locatorReport, value, maskValue);
}

/** Metni verilen degere ESIT (exact) ya da ICEREN ilk gorunur elemana tiklar. */
export async function clickByText(
  page: Page,
  value: string,
  options: TextMatchOptions = {},
) {
  const exact = options.exact ?? true;
  const target = page.getByText(value, { exact }).first();

  // Runtime degerine bagli dinamik locator: LOCATOR_REPORTS'a statik giremez,
  // bu yuzden rapor metadatasi burada uretilir.
  const report: LocatorReport = {
    name: `getByText(${exact ? '=' : '~'} "${value}")`,
    value: `text ${exact ? 'equals' : 'contains'} "${value}"`,
  };

  await click(target, report);
}

export async function collectVisibleBusinessTexts(page: Page): Promise<VisibleBusinessTextAudit> {
  try {
    const audit = await page.evaluate(() => {
      type ScopeCandidate = {
        element: HTMLElement;
        label: string;
        textLength: number;
      };

      function isElementVisible(element: HTMLElement) {
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          return false;
        }

        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }

      function normalizeText(value: string) {
        return value
          .replace(/[\u200B-\u200D\uFEFF]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      }

      function textLength(element: HTMLElement) {
        return normalizeText(element.innerText ?? '').length;
      }

      function visibleCandidates(selector: string, label: string): ScopeCandidate[] {
        return Array.from(document.querySelectorAll<HTMLElement>(selector))
          .filter(isElementVisible)
          .map((element, index) => ({
            element,
            label: `${label}[${index}]`,
            textLength: textLength(element),
          }))
          .filter((candidate) => candidate.textLength > 0);
      }

      const formCandidates = visibleCandidates('form', 'form');
      const mainCandidates = [
        ...visibleCandidates('[role="main"]', 'role=main'),
        ...visibleCandidates('main', 'main'),
      ];

      const candidates = formCandidates.length > 0 ? formCandidates : mainCandidates;
      const scope = candidates.sort((left, right) => right.textLength - left.textLength)[0]
        ?? {
          element: document.body,
          label: 'body',
          textLength: textLength(document.body),
        };

      const excludedSelector = [
        '[aria-hidden="true"]',
        '[hidden]',
        '[inert]',
        'nav',
        'aside',
        '[role="navigation"]',
        '[role="complementary"]',
        'script',
        'style',
        'noscript',
        'svg',
        'canvas',
        '.material-icons',
        '.notranslate',
        '.MuiIcon-root',
      ].join(',');

      const walker = document.createTreeWalker(scope.element, NodeFilter.SHOW_TEXT);
      const lines: string[] = [];
      const seen = new Set<string>();

      let node = walker.nextNode();
      while (node) {
        const parent = node.parentElement;
        if (!parent || !isElementVisible(parent) || parent.closest(excludedSelector)) {
          node = walker.nextNode();
          continue;
        }

        const line = normalizeText(node.textContent ?? '');
        if (!line || line === '*' || seen.has(line)) {
          node = walker.nextNode();
          continue;
        }

        seen.add(line);
        lines.push(line);
        node = walker.nextNode();
      }

      return {
        scope: scope.label,
        lines,
      };
    });

    const route = new URL(page.url()).hash || new URL(page.url()).pathname;

    reportAction({
      action: 'Audit visible business text',
      locatorName: audit.scope,
      locatorValue: 'visible user-facing business text nodes',
      value: `${audit.lines.length} satır`,
    });

    return {
      route,
      ...audit,
    };
  } catch (error) {
    reportError({
      action: 'Audit visible business text',
      locatorName: 'visible user-facing business text nodes',
      error,
    });
    throw error;
  }
}
