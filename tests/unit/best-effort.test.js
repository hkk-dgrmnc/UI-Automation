const assert = require('node:assert/strict');
const test = require('node:test');
require('ts-node/register');

const { runBestEffort } = require('../../src/utils/best-effort');

test('runBestEffort returns a secondary failure instead of throwing it', async () => {
  const failureError = new Error('secondary failure');
  const logged = [];

  const failure = await runBestEffort(
    'Attach screenshot',
    async () => {
      throw failureError;
    },
    (entry) => logged.push(entry),
  );

  assert.deepEqual(failure, {
    operation: 'Attach screenshot',
    error: failureError,
  });
  assert.deepEqual(logged, [failure]);
});

test('runBestEffort also contains failures from the secondary logger', async () => {
  const failure = await runBestEffort(
    'Close browser',
    async () => {
      throw new Error('close failure');
    },
    () => {
      throw new Error('logger failure');
    },
  );

  assert.equal(failure.operation, 'Close browser');
  assert.match(failure.error.message, /close failure/u);
});
