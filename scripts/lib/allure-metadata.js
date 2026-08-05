const { createHash } = require('node:crypto');

const SUPPORTED_BROWSERS = new Set(['chromium', 'firefox', 'webkit']);

function parseWorldParameters(argv) {
  let found = false;
  let rawValue;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === '--world-parameters') {
      found = true;
      rawValue = argv[index + 1];
      break;
    }

    if (argument.startsWith('--world-parameters=')) {
      found = true;
      rawValue = argument.slice('--world-parameters='.length);
      break;
    }
  }

  if (!found) {
    return {};
  }

  if (typeof rawValue !== 'string' || rawValue.length === 0) {
    throw new Error('--world-parameters requires a JSON object value.');
  }

  let parameters;
  try {
    parameters = JSON.parse(rawValue);
  } catch (error) {
    throw new Error(`Invalid --world-parameters JSON: ${error.message}`, { cause: error });
  }

  if (parameters === null || Array.isArray(parameters) || typeof parameters !== 'object') {
    throw new Error('--world-parameters must contain a JSON object.');
  }

  return parameters;
}

function resolveBrowser(argv, environment = {}) {
  const parameters = parseWorldParameters(argv);
  const browser = parameters.browser ?? environment.BROWSER ?? 'chromium';

  if (typeof browser !== 'string' || !SUPPORTED_BROWSERS.has(browser)) {
    throw new Error(
      `Unsupported browser "${String(browser)}". Expected one of: ${[...SUPPORTED_BROWSERS].join(
        ', ',
      )}.`,
    );
  }

  return browser;
}

function resolveResultsMode(argv) {
  const append = argv.includes('--append');
  const explicitClean = argv.includes('--clean');

  if (append && explicitClean) {
    throw new Error('--append and --clean cannot be used together.');
  }

  return append ? 'append' : 'clean';
}

function stableHistoryId(baseId, browser) {
  return createHash('sha256').update(`${baseId}|browser=${browser}`).digest('hex');
}

function addBrowserMetadata(result, browser, fallbackId = 'unknown-test') {
  const baseId =
    result.historyId ?? result.testCaseId ?? result.fullName ?? result.name ?? fallbackId;
  const parameters = Array.isArray(result.parameters)
    ? result.parameters.filter(
        (parameter) => parameter.name !== 'Browser' && parameter.name !== 'Run ID',
      )
    : [];

  parameters.push({ name: 'Browser', value: browser });

  return {
    ...result,
    historyId: stableHistoryId(baseId, browser),
    parameters,
  };
}

function getResultBrowser(result) {
  if (!Array.isArray(result.parameters)) {
    return undefined;
  }

  return result.parameters.find((parameter) => parameter.name === 'Browser')?.value;
}

function updateEnvironmentBrowsers(content, browsers) {
  const browserValue = [...new Set(browsers)].sort().join(', ');
  const lines = content
    .split(/\r?\n/u)
    .filter((line) => line.length > 0 && !line.startsWith('browser='));

  lines.push(`browser=${browserValue}`);
  return `${lines.join('\n')}\n`;
}

module.exports = {
  addBrowserMetadata,
  getResultBrowser,
  parseWorldParameters,
  resolveBrowser,
  resolveResultsMode,
  stableHistoryId,
  updateEnvironmentBrowsers,
};
