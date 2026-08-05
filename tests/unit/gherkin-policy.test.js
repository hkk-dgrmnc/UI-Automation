const assert = require('node:assert/strict');
const test = require('node:test');
const {
  analyzeFeatureSource,
  compareWithBaseline,
  validateBaselineEntries,
} = require('../../scripts/lib/gherkin-policy');

test('analyzeFeatureSource accepts inherited category tags, manual IDs, and star steps', () => {
  const source = `@smoke @auth
Feature: Login
  Scenario: TC_001 - Kullanıcı giriş yapar
    * Login ekranı açılır
`;

  assert.deepEqual(analyzeFeatureSource(source, 'features/cases/smoke/TC_001_login.feature'), []);
});

test('analyzeFeatureSource reports policy violations with stable fingerprints', () => {
  const source = `Feature: Login
  Scenario: kullanıcı giriş yapar
    Given Login ekranı açılır
`;
  const violations = analyzeFeatureSource(source, 'features/cases/regression/login.feature');

  assert.deepEqual(
    violations.map((violation) => violation.code),
    ['scenario-id', 'scenario-tags', 'category-tag', 'step-keyword'],
  );
  assert.equal(
    violations[0].fingerprint,
    'scenario-id::features/cases/regression/login.feature::kullanıcı giriş yapar::kullanıcı giriş yapar',
  );
});

test('compareWithBaseline separates accepted, new, and stale entries', () => {
  const violations = [{ fingerprint: 'accepted' }, { fingerprint: 'new' }];
  const baseline = [
    { fingerprint: 'accepted', reason: 'legacy' },
    { fingerprint: 'stale', reason: 'fixed' },
  ];

  assert.deepEqual(compareWithBaseline(violations, baseline), {
    accepted: [{ fingerprint: 'accepted' }],
    newViolations: [{ fingerprint: 'new' }],
    staleBaseline: [{ fingerprint: 'stale', reason: 'fixed' }],
  });
});

test('validateBaselineEntries rejects missing reasons and duplicate fingerprints', () => {
  const errors = validateBaselineEntries([
    { fingerprint: 'duplicate', reason: '' },
    { fingerprint: 'duplicate', reason: 'second entry' },
  ]);

  assert.equal(errors.length, 2);
  assert.match(errors[0], /must explain its reason/u);
  assert.match(errors[1], /Duplicate baseline entry/u);
});
