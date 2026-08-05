const { spawnSync } = require('node:child_process');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const extension = process.platform === 'win32' ? '.cmd' : '';
const cucumber = path.join(ROOT, 'node_modules', '.bin', `cucumber-js${extension}`);
const result = spawnSync(cucumber, ['--profile', 'cases', '--dry-run', '--format', 'progress'], {
  cwd: ROOT,
  env: {
    ...process.env,
    BASE_URL: process.env.BASE_URL ?? 'https://example.invalid',
  },
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

if (result.signal) {
  console.error(`cucumber-js stopped with signal ${result.signal}`);
  process.exit(1);
}

process.exit(typeof result.status === 'number' ? result.status : 1);
