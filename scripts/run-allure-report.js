const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const profile = process.argv[2] ?? 'allure';
const rawArgs = process.argv.slice(3);
const cleanMode = rawArgs.includes('--clean');
const cucumberArgs = rawArgs.filter((arg) => arg !== '--append' && arg !== '--clean');
const resultsDir = path.join(ROOT, 'allure-results');
const reportDir = path.join(ROOT, 'allure-report');
const runId = process.env.ALLURE_RUN_ID
  ?? `run-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${process.pid}`;

function localBin(name) {
  const extension = process.platform === 'win32' ? '.cmd' : '';
  return path.join(ROOT, 'node_modules', '.bin', `${name}${extension}`);
}

function listResultFiles() {
  if (!fs.existsSync(resultsDir)) {
    return [];
  }

  return fs.readdirSync(resultsDir)
    .filter((name) => name.endsWith('-result.json'))
    .map((name) => path.join(resultsDir, name));
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    env: {
      ...process.env,
      ALLURE_RUN_ID: runId,
    },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.error) {
    console.error(result.error.message);
    return 1;
  }

  if (result.signal) {
    console.error(`${command} stopped with signal ${result.signal}`);
    return 1;
  }

  return typeof result.status === 'number' ? result.status : 1;
}

function addRunMetadata(existingResultFiles) {
  const existing = new Set(existingResultFiles);
  let updatedCount = 0;

  for (const file of listResultFiles()) {
    if (existing.has(file)) {
      continue;
    }

    const result = JSON.parse(fs.readFileSync(file, 'utf8'));
    const baseId = result.testCaseId ?? result.fullName ?? result.name ?? path.basename(file);
    const runSpecificId = `${baseId}#${runId}`;

    result.testCaseId = runSpecificId;
    result.historyId = runSpecificId;
    result.parameters = Array.isArray(result.parameters)
      ? result.parameters.filter((parameter) => parameter.name !== 'Run ID')
      : [];
    result.parameters.push({ name: 'Run ID', value: runId });

    fs.writeFileSync(file, `${JSON.stringify(result)}\n`, 'utf8');
    updatedCount += 1;
  }

  console.log(`Allure result metadata updated: ${updatedCount}`);
}

console.log(`Allure Run ID: ${runId}`);

if (cleanMode) {
  fs.rmSync(resultsDir, { recursive: true, force: true });
}

fs.rmSync(reportDir, { recursive: true, force: true });

const existingResultFiles = listResultFiles();

const cucumberStatus = run(localBin('cucumber-js'), [
  '--profile',
  profile,
  ...cucumberArgs,
]);

let allureStatus = 0;
if (fs.existsSync(resultsDir)) {
  addRunMetadata(existingResultFiles);

  allureStatus = run(localBin('allure'), [
    'generate',
    'allure-results',
    '--clean',
    '-o',
    'allure-report',
  ]);
} else {
  console.error('allure-results bulunamadi; Allure raporu uretilemedi.');
  allureStatus = 1;
}

process.exit(cucumberStatus !== 0 ? cucumberStatus : allureStatus);
