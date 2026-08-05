const fs = require('node:fs');
const path = require('node:path');
const {
  analyzeFeatureSource,
  compareWithBaseline,
  validateBaselineEntries,
} = require('./lib/gherkin-policy');

const ROOT = path.join(__dirname, '..');
const FEATURES_ROOT = path.join(ROOT, 'features', 'cases');
const BASELINE_FILE = path.join(ROOT, 'config', 'gherkin-policy-baseline.json');

function listFeatureFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return listFeatureFiles(absolutePath);
    }

    return entry.isFile() && entry.name.endsWith('.feature') ? [absolutePath] : [];
  });
}

function relativePath(absolutePath) {
  return path.relative(ROOT, absolutePath).split(path.sep).join('/');
}

function printViolation(prefix, violation) {
  console.error(
    `${prefix} ${violation.path}:${violation.line} [${violation.code}] ${violation.message}`,
  );
}

function main() {
  const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
  const baselineEntries = Array.isArray(baseline.entries) ? baseline.entries : [];
  const baselineErrors = validateBaselineEntries(baselineEntries);

  if (baseline.version !== 1) {
    baselineErrors.push(`Unsupported Gherkin policy baseline version: ${baseline.version}`);
  }

  if (baselineErrors.length > 0) {
    for (const error of baselineErrors) {
      console.error(`BASELINE ERROR: ${error}`);
    }
    process.exit(1);
  }

  const violations = listFeatureFiles(FEATURES_ROOT).flatMap((featureFile) =>
    analyzeFeatureSource(fs.readFileSync(featureFile, 'utf8'), relativePath(featureFile)),
  );
  const comparison = compareWithBaseline(violations, baselineEntries);

  for (const violation of comparison.newViolations) {
    printViolation('NEW VIOLATION:', violation);
  }

  for (const entry of comparison.staleBaseline) {
    console.error(
      `STALE BASELINE: ${entry.fingerprint}. Remove it after the underlying violation is fixed.`,
    );
  }

  if (comparison.newViolations.length > 0 || comparison.staleBaseline.length > 0) {
    process.exit(1);
  }

  if (comparison.accepted.length > 0) {
    console.warn(
      `Gherkin policy passed with ${comparison.accepted.length} documented legacy violation(s).`,
    );
    for (const violation of comparison.accepted) {
      console.warn(
        `LEGACY: ${violation.path}:${violation.line} [${violation.code}] ${violation.detail}`,
      );
    }
    return;
  }

  console.log('Gherkin policy passed without violations.');
}

main();
