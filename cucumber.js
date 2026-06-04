const common = {
  requireModule: ['ts-node/register'],
  require: ['features/support/**/*.ts', 'features/step-definitions/**/*.ts'],
  format: [
    './features/support/grouped-test-result-formatter.js',
    'html:cucumber-report.html',
    'json:cucumber-report.json',
  ],
  publishQuiet: true,
};

module.exports = {
  default: common,
  all: {
    ...common,
    paths: ['features/**/*.feature'],
  },
};
