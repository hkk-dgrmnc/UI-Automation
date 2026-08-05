const assert = require('node:assert/strict');
const test = require('node:test');
require('ts-node/register');

const { reportAction, runWithActionReport } = require('../../src/utils/action-report');

function recordAction() {
  reportAction({
    action: 'Click',
    locatorName: 'common.example',
    locatorValue: 'role=button name="Example"',
  });
}

test('action report attachment failure never masks the primary step failure', async (context) => {
  const primaryError = new Error('primary step failure');
  const originalLog = console.log;
  const originalWarn = console.warn;
  console.log = () => {};
  console.warn = () => {};
  context.after(() => {
    console.log = originalLog;
    console.warn = originalWarn;
  });

  await assert.rejects(
    runWithActionReport(
      async () => {
        throw new Error('attachment failure');
      },
      async () => {
        recordAction();
        throw primaryError;
      },
    ),
    (error) => error === primaryError,
  );
});

test('action report attachment is best effort after a successful callback', async (context) => {
  const originalLog = console.log;
  const originalWarn = console.warn;
  console.log = () => {};
  console.warn = () => {};
  context.after(() => {
    console.log = originalLog;
    console.warn = originalWarn;
  });

  const result = await runWithActionReport(
    async () => {
      throw new Error('attachment failure');
    },
    async () => {
      recordAction();
      return 'step result';
    },
  );

  assert.equal(result, 'step result');
});
