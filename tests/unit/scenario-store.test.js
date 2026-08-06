const assert = require('node:assert/strict');
const test = require('node:test');
require('ts-node/register');

const { ScenarioStore } = require('../../features/support/scenario-store');

test('ScenarioStore saves, overwrites, and returns scenario-local runtime values', () => {
  const store = new ScenarioStore();

  assert.equal(store.has('selected-currency'), false);
  store.save('selected-currency', 'USD');
  assert.equal(store.has('selected-currency'), true);
  assert.equal(store.get('selected-currency'), 'USD');

  store.save('selected-currency', 'EUR');
  assert.equal(store.get('selected-currency'), 'EUR');
});

test('ScenarioStore instances are isolated and missing values fail explicitly', () => {
  const firstScenario = new ScenarioStore();
  const secondScenario = new ScenarioStore();

  firstScenario.save('record-id', '42');

  assert.equal(firstScenario.get('record-id'), '42');
  assert.equal(secondScenario.has('record-id'), false);
  assert.throws(
    () => secondScenario.get('record-id'),
    /"record-id" adiyla kaydedilmis bir deger yok/u,
  );
});
