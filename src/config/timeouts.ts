export const TIMEOUTS = {
  cucumberStep: 90_000,
  uiOperation: 30_000,
  loginLandingStability: 10_000,
} as const;

export type TimeoutOptions = {
  timeout?: number;
};

export function resolveUiTimeout(options: TimeoutOptions = {}): number {
  const timeout = options.timeout ?? TIMEOUTS.uiOperation;

  if (!Number.isFinite(timeout) || timeout <= 0) {
    throw new RangeError(`Timeout must be a positive finite number. Received: ${timeout}`);
  }

  return timeout;
}
