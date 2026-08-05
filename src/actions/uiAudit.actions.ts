import { Page } from '@playwright/test';
import { reportAction, reportError } from '../utils/action-report';

export type VisibleBusinessTextAudit = {
  route: string;
  scope: string;
  lines: string[];
};

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
      const scope = candidates.sort((left, right) => right.textLength - left.textLength)[0] ?? {
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
