const os = require('node:os');
const { resolveBrowser } = require('./scripts/lib/allure-metadata');

const configuredBrowser = resolveBrowser(process.argv.slice(2), process.env);

const sharedConfig = {
  requireModule: ['ts-node/register'],
  require: ['features/support/**/*.ts', 'features/step-definitions/**/*.ts'],
  format: [
    './features/support/grouped-test-result-formatter.js',
    'html:cucumber-report.html',
    'json:cucumber-report.json',
    'allure-cucumberjs/reporter',
  ],
  formatOptions: {
    resultsDir: 'allure-results',
    environmentInfo: {
      os_platform: os.platform(),
      os_release: os.release(),
      node_version: process.version,
      browser: configuredBrowser,
      running_env: process.env.RUNNING_ENV ?? 'test',
    },
  },
  publishQuiet: true,
};

module.exports = {
  // Paths yok: VS Code cucumberRunner bu profili kullanır, CLI'dan gelen path tek kaynak olur
  default: sharedConfig,
  cases: {
    ...sharedConfig,
    paths: ['features/cases/**/*.feature'],
  },
  smoke: {
    ...sharedConfig,
    paths: ['features/cases/smoke/**/*.feature'],
  },
  regression: {
    ...sharedConfig,
    paths: ['features/cases/regression/**/*.feature'],
  },
  all: {
    ...sharedConfig,
    paths: ['features/**/*.feature'],
  },
  allure: {
    ...sharedConfig,
    paths: ['features/cases/**/*.feature'],
  },
  'allure-smoke': {
    ...sharedConfig,
    paths: ['features/cases/smoke/**/*.feature'],
  },
  'allure-regression': {
    ...sharedConfig,
    paths: ['features/cases/regression/**/*.feature'],
  },
  'allure-vscode': sharedConfig,
};
