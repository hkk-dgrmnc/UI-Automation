'use strict';

// Cucumber'in varsayilan ilerleme/ozet ciktisini bastirir; adim adim renkli cikti
// hooks.ts ve action-report.ts tarafindan uretilir. Bu formatter ek olarak kosu
// sonunda gecen/kalan senaryo ozetini ve toplam sureyi yazar (CI gorunurlugu icin).
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[92m',
  red: '\x1b[91m',
  yellow: '\x1b[93m',
  gray: '\x1b[90m',
};

// Senaryo durumu, adimlarinin en kotu sonucu ile belirlenir.
const STATUS_ORDER = [
  'PASSED',
  'SKIPPED',
  'PENDING',
  'UNDEFINED',
  'AMBIGUOUS',
  'FAILED',
  'UNKNOWN',
];
const rank = (status) => {
  const index = STATUS_ORDER.indexOf(status);
  return index === -1 ? STATUS_ORDER.length : index;
};
const STATUS_COLOR = {
  PASSED: C.green,
  FAILED: C.red,
  SKIPPED: C.gray,
  PENDING: C.yellow,
  UNDEFINED: C.yellow,
  AMBIGUOUS: C.yellow,
  UNKNOWN: C.gray,
};

module.exports = {
  type: 'formatter',
  formatter({ on }) {
    const worstStatusByCase = new Map();
    const scenarioCountByStatus = {};
    let scenarioTotal = 0;
    let startedAt = 0;

    on('message', (envelope) => {
      if (envelope.testRunStarted) {
        startedAt = Date.now();
        return;
      }

      if (envelope.testStepFinished) {
        const { testCaseStartedId, testStepResult } = envelope.testStepFinished;
        const status = testStepResult.status;
        const previous = worstStatusByCase.get(testCaseStartedId);
        if (previous === undefined || rank(status) > rank(previous)) {
          worstStatusByCase.set(testCaseStartedId, status);
        }
        return;
      }

      if (envelope.testCaseFinished) {
        const status =
          worstStatusByCase.get(envelope.testCaseFinished.testCaseStartedId) ?? 'UNKNOWN';
        scenarioTotal += 1;
        scenarioCountByStatus[status] = (scenarioCountByStatus[status] || 0) + 1;
        return;
      }

      if (envelope.testRunFinished) {
        const seconds = startedAt ? ((Date.now() - startedAt) / 1000).toFixed(1) : '0.0';
        const passed = scenarioCountByStatus.PASSED || 0;
        const allPassed = scenarioTotal > 0 && passed === scenarioTotal;
        const headColor = allPassed ? C.green : C.red;

        const breakdown = Object.keys(scenarioCountByStatus)
          .sort((a, b) => rank(a) - rank(b))
          .map(
            (status) =>
              `${STATUS_COLOR[status] || C.gray}${scenarioCountByStatus[status]} ${status.toLowerCase()}${C.reset}`,
          )
          .join(`${C.dim}, ${C.reset}`);

        console.log(`\n${C.bold}${headColor}  ◆  ÖZET${C.reset}`);
        console.log(
          `     ${C.bold}${scenarioTotal}${C.reset} senaryo  ${C.dim}(${C.reset}${breakdown}${C.dim})${C.reset}`,
        );
        console.log(`     ${C.gray}süre: ${seconds}s${C.reset}\n`);
        return;
      }
    });
  },
};
