const assert = require('node:assert/strict');
const test = require('node:test');
require('ts-node/register');

const { TIMEOUTS, resolveUiTimeout } = require('../../src/config/timeouts');

test('resolveUiTimeout uses the centralized UI default and accepts a runtime override', () => {
  assert.equal(resolveUiTimeout(), TIMEOUTS.uiOperation);
  assert.equal(resolveUiTimeout({ timeout: 12_345 }), 12_345);
});

test('resolveUiTimeout rejects invalid runtime values', () => {
  for (const timeout of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => resolveUiTimeout({ timeout }), RangeError);
  }
});
