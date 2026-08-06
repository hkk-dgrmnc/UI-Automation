const assert = require('node:assert/strict');
const test = require('node:test');
require('ts-node/register');

const { waitForSeconds } = require('../../src/actions/common.actions');

test('waitForSeconds converts integer and comma-decimal seconds to milliseconds', async () => {
  const originalSetTimeout = global.setTimeout;
  const observedDelays = [];

  global.setTimeout = (callback, delay) => {
    observedDelays.push(delay);
    callback();
    return 0;
  };

  try {
    await waitForSeconds('20');
    await waitForSeconds('1,5');
    await waitForSeconds(' 0.001 ');
  } finally {
    global.setTimeout = originalSetTimeout;
  }

  assert.deepEqual(observedDelays, [20_000, 1_500, 1]);
});

test('waitForSeconds rejects invalid, non-positive, and overlong values', async () => {
  for (const value of ['', 'abc', '0', '-1', '1e3', '1.0001', '90']) {
    await assert.rejects(waitForSeconds(value), RangeError);
  }
});
