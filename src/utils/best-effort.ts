export type SecondaryFailure = {
  operation: string;
  error: unknown;
};

export type SecondaryFailureLogger = (failure: SecondaryFailure) => void;

export function formatUnknownError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  try {
    return String(error);
  } catch {
    return 'Unknown error';
  }
}

export function logSecondaryFailure(failure: SecondaryFailure): void {
  console.warn(`[secondary failure] ${failure.operation}: ${formatUnknownError(failure.error)}`);
}

/**
 * Runs diagnostics/reporting/cleanup without replacing an already active test
 * failure. The returned failure lets the caller decide whether a successful
 * scenario should still fail because its teardown was incomplete.
 */
export async function runBestEffort(
  operation: string,
  callback: () => unknown | Promise<unknown>,
  logger: SecondaryFailureLogger = logSecondaryFailure,
): Promise<SecondaryFailure | undefined> {
  try {
    await callback();
    return undefined;
  } catch (error) {
    const failure = { operation, error };

    try {
      logger(failure);
    } catch {
      // Diagnostic logging is best effort too and must never replace test output.
    }

    return failure;
  }
}
