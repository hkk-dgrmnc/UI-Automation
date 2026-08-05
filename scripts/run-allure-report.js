const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const {
  addBrowserMetadata,
  getResultBrowser,
  resolveBrowser,
  resolveResultsMode,
  updateEnvironmentBrowsers,
} = require('./lib/allure-metadata');

const ROOT = path.join(__dirname, '..');
const profile = process.argv[2] ?? 'allure';
const rawArgs = process.argv.slice(3);
const cucumberArgs = rawArgs.filter((arg) => arg !== '--append' && arg !== '--clean');
const resultsDir = path.join(ROOT, 'allure-results');
const reportDir = path.join(ROOT, 'allure-report');
const environmentFile = path.join(resultsDir, 'environment.properties');

let browser;
let resultsMode;
try {
  browser = resolveBrowser(cucumberArgs, process.env);
  resultsMode = resolveResultsMode(rawArgs);
} catch (error) {
  console.error(error.message);
  process.exit(2);
}

function localBin(name) {
  const extension = process.platform === 'win32' ? '.cmd' : '';
  return path.join(ROOT, 'node_modules', '.bin', `${name}${extension}`);
}

function listResultFiles() {
  if (!fs.existsSync(resultsDir)) {
    return [];
  }

  return fs
    .readdirSync(resultsDir)
    .filter((name) => name.endsWith('-result.json'))
    .map((name) => path.join(resultsDir, name));
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    env: {
      ...process.env,
      BROWSER: browser,
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

function addResultMetadata(existingResultFiles) {
  const existing = new Set(existingResultFiles);
  let updatedCount = 0;

  for (const file of listResultFiles()) {
    if (existing.has(file)) {
      continue;
    }

    const result = JSON.parse(fs.readFileSync(file, 'utf8'));
    const updatedResult = addBrowserMetadata(result, browser, path.basename(file));

    fs.writeFileSync(file, `${JSON.stringify(updatedResult)}\n`, 'utf8');
    updatedCount += 1;
  }

  console.log(`Allure result metadata updated for ${browser}: ${updatedCount}`);
}

function updateEnvironmentMetadata() {
  const browsers = [];

  for (const file of listResultFiles()) {
    const result = JSON.parse(fs.readFileSync(file, 'utf8'));
    const resultBrowser = getResultBrowser(result);

    if (resultBrowser) {
      browsers.push(resultBrowser);
    }
  }

  const content = fs.existsSync(environmentFile) ? fs.readFileSync(environmentFile, 'utf8') : '';
  fs.writeFileSync(
    environmentFile,
    updateEnvironmentBrowsers(content, browsers.length > 0 ? browsers : [browser]),
    'utf8',
  );
}

console.log(`Allure browser: ${browser}`);
console.log(`Allure results mode: ${resultsMode === 'append' ? 'append' : 'current run (clean)'}`);

if (resultsMode === 'clean') {
  fs.rmSync(resultsDir, { recursive: true, force: true });
}

fs.rmSync(reportDir, { recursive: true, force: true });

const existingResultFiles = listResultFiles();

const cucumberStatus = run(localBin('cucumber-js'), ['--profile', profile, ...cucumberArgs]);

let allureStatus;
if (fs.existsSync(resultsDir)) {
  addResultMetadata(existingResultFiles);
  updateEnvironmentMetadata();

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
