import { AsyncLocalStorage } from 'node:async_hooks';

type Attach = (data: string, mediaType: 'text/plain') => void | Promise<void>;

type ActionReportContext = {
  attach: Attach;
};

type ReportActionOptions = {
  action: string;
  locatorName: string;
  locatorValue: string;
  value?: string;
  maskValue?: boolean;
};

type ReportAssertionOptions = {
  assertion: string;
  locatorName: string;
  locatorValue: string;
  expected: string;
};

const actionReportContext = new AsyncLocalStorage<ActionReportContext>();

export async function runWithActionReport<T>(
  attach: Attach,
  callback: () => Promise<T> | T,
): Promise<T> {
  return actionReportContext.run({ attach }, async () => callback());
}

export async function reportAction(options: ReportActionOptions) {
  const context = actionReportContext.getStore();

  if (!context) {
    return;
  }

  const lines = [
    `Action: ${options.action}`,
    `Locator Name: ${options.locatorName}`,
    `Locator Value: ${options.locatorValue}`,
  ];

  if (options.value !== undefined) {
    lines.push(`Value: ${options.maskValue ? '********' : options.value}`);
  }

  await context.attach(lines.join('\n'), 'text/plain');
}

export async function reportAssertion(options: ReportAssertionOptions) {
  const context = actionReportContext.getStore();

  if (!context) {
    return;
  }

  await context.attach([
    `Assertion: ${options.assertion}`,
    `Locator Name: ${options.locatorName}`,
    `Locator Value: ${options.locatorValue}`,
    `Expected: ${options.expected}`,
  ].join('\n'), 'text/plain');
}
