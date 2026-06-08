const sharedConfig = {
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
  // Paths yok: VS Code cucumberRunner bu profili kullanır, CLI'dan gelen path tek kaynak olur
  default: sharedConfig,
  generated: {
    ...sharedConfig,
    paths: ['features/generated/**/*.feature'],
  },
  all: {
    ...sharedConfig,
    paths: ['features/**/*.feature'],
  },
};
