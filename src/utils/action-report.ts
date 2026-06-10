import { AsyncLocalStorage } from 'node:async_hooks';
import { COLORS as C, INDENT } from './console-format';

type Attach = (data: string, mediaType: string) => void | Promise<void>;

type ActionReportContext = {
  attach: Attach;
  lines: string[];
};

export type LocatorReport = {
  name: string;
  value: string;
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

type ReportErrorOptions = {
  action: string;
  locatorName: string;
  error: unknown;
};

const actionReportContext = new AsyncLocalStorage<ActionReportContext>();

export async function runWithActionReport<T>(
  attach: Attach,
  callback: () => Promise<T> | T,
): Promise<T> {
  const lines: string[] = [];

  try {
    return await actionReportContext.run({ attach, lines }, async () => callback());
  } finally {
    if (lines.length > 0) {
      await attach(lines.join('\n'), 'text/plain');
    }
  }
}

function logAction(action: string, locatorName: string, value?: string) {
  const label = `${C.bold}${C.cyan} ACTION ${C.reset}`;
  const line = [`${C.bold}${action}${C.reset}`, `${C.gray}${locatorName}${C.reset}`];
  if (value !== undefined) line.push(`${C.dim}▸ ${value}${C.reset}`);
  console.log(`${INDENT}${label}  ${line.join('  ')}`);
}

function logAssert(assertion: string, locatorName: string, expected: string) {
  const label = `${C.bold}${C.green} ASSERT ${C.reset}`;
  console.log(`${INDENT}${label}  ${C.bold}${assertion}${C.reset}  ${C.gray}${locatorName}${C.reset}  ${C.dim}→ ${expected}${C.reset}`);
}

function logError(action: string, locatorName: string, message: string) {
  const label = `${C.bold}${C.red}  ERROR ${C.reset}`;
  console.log(`${INDENT}${label}  ${C.bold}${action}${C.reset}  ${C.gray}${locatorName}${C.reset}`);
  console.log(`${INDENT}         ${C.red}${C.dim}${message}${C.reset}`);
}

export function reportAction(options: ReportActionOptions) {
  const context = actionReportContext.getStore();

  const displayValue = options.value !== undefined
    ? (options.maskValue ? '••••••••' : options.value)
    : undefined;

  logAction(options.action, options.locatorName, displayValue);

  if (!context) {
    return;
  }

  const parts = ['ACTION', options.action, `Locator Name: ${options.locatorName}`, `Locator Value: ${options.locatorValue}`];
  if (displayValue !== undefined) parts.push(`▸ ${displayValue}`);
  context.lines.push(parts.join('   '));
}

export function reportAssertion(options: ReportAssertionOptions) {
  const context = actionReportContext.getStore();

  logAssert(options.assertion, options.locatorName, options.expected);

  if (!context) {
    return;
  }

  context.lines.push(['ASSERT', options.assertion, `Locator Name: ${options.locatorName}`, `Locator Value: ${options.locatorValue}`, `→ ${options.expected}`].join('   '));
}

export function reportError(options: ReportErrorOptions) {
  const context = actionReportContext.getStore();
  const message = options.error instanceof Error
    ? options.error.message
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .slice(0, 4)
        .join(' · ')
    : String(options.error);

  logError(`${options.action} failed`, options.locatorName, message);

  if (!context) {
    return;
  }

  context.lines.push(`ERROR    ${options.action} failed   ${options.locatorName}`);
  context.lines.push(`         ${message}`);
}
