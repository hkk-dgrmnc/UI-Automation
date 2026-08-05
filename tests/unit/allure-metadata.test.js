const assert = require('node:assert/strict');
const test = require('node:test');
const {
  addBrowserMetadata,
  parseWorldParameters,
  resolveBrowser,
  resolveResultsMode,
  stableHistoryId,
  updateEnvironmentBrowsers,
} = require('../../scripts/lib/allure-metadata');

test('parseWorldParameters supports separated and equals syntax', () => {
  assert.deepEqual(parseWorldParameters(['--world-parameters', '{"browser":"firefox"}']), {
    browser: 'firefox',
  });
  assert.deepEqual(parseWorldParameters(['--world-parameters={"browser":"webkit"}']), {
    browser: 'webkit',
  });
});

test('resolveBrowser gives world parameters precedence and validates the browser', () => {
  assert.equal(
    resolveBrowser(['--world-parameters', '{"browser":"firefox"}'], {
      BROWSER: 'chromium',
    }),
    'firefox',
  );
  assert.throws(
    () => parseWorldParameters(['--world-parameters']),
    /requires a JSON object value/u,
  );
  assert.throws(() => resolveBrowser([], { BROWSER: 'edge' }), /Unsupported browser/u);
});

test('resolveResultsMode is clean by default and append only when explicitly requested', () => {
  assert.equal(resolveResultsMode([]), 'clean');
  assert.equal(resolveResultsMode(['--clean']), 'clean');
  assert.equal(resolveResultsMode(['--append']), 'append');
  assert.throws(() => resolveResultsMode(['--append', '--clean']), /cannot be used together/u);
});

test('stableHistoryId is repeatable and browser-specific', () => {
  const first = stableHistoryId('test-case-id', 'chromium');

  assert.equal(first, stableHistoryId('test-case-id', 'chromium'));
  assert.notEqual(first, stableHistoryId('test-case-id', 'firefox'));
});

test('addBrowserMetadata uses reporter history and removes run parameters without changing testCaseId', () => {
  const result = addBrowserMetadata(
    {
      historyId: 'reporter-history-id',
      parameters: [
        { name: 'Run ID', value: 'run-1' },
        { name: 'Business parameter', value: 'value' },
      ],
      testCaseId: 'stable-test-case',
    },
    'webkit',
  );

  assert.equal(result.testCaseId, 'stable-test-case');
  assert.equal(result.historyId, stableHistoryId('reporter-history-id', 'webkit'));
  assert.deepEqual(result.parameters, [
    { name: 'Business parameter', value: 'value' },
    { name: 'Browser', value: 'webkit' },
  ]);
});

test('updateEnvironmentBrowsers replaces stale browser data with sorted unique values', () => {
  assert.equal(
    updateEnvironmentBrowsers('os_platform=win32\nbrowser=chromium\n', [
      'webkit',
      'chromium',
      'webkit',
    ]),
    'os_platform=win32\nbrowser=chromium, webkit\n',
  );
});
