require('dotenv/config');

function printUsageAndExit(exitCode = 2) {
  console.error(
    [
      'Usage:',
      '  node scripts/check-env.js [--user USER1] [--key EXTRA_ENV_KEY]',
      '',
      'Examples:',
      '  npm run env:check',
      '  npm run env:check -- --user USER2 --key API_BASE_URL',
    ].join('\n'),
  );
  process.exit(exitCode);
}

function parseArgs(argv) {
  const args = {
    keys: ['BASE_URL'],
    users: ['USER1'],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--key') {
      args.keys.push(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--user') {
      args.users.push(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      printUsageAndExit(0);
    }

    console.error(`Unknown argument: ${arg}`);
    printUsageAndExit();
  }

  args.keys = [...new Set(args.keys.filter(Boolean))];
  args.users = [...new Set(args.users.filter(Boolean))];

  return args;
}

function assertDefined(name, missing) {
  if (!process.env[name]) {
    missing.push(name);
    return;
  }

  console.log(`OK ${name}: defined`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const missing = [];

  for (const key of args.keys) {
    assertDefined(key, missing);
  }

  for (const userKey of args.users) {
    assertDefined(`${userKey}_USERNAME`, missing);
    assertDefined(`${userKey}_PASSWORD`, missing);
  }

  if (missing.length > 0) {
    console.error(`Missing required environment values: ${missing.join(', ')}`);
    process.exit(1);
  }

  console.log('Environment check passed. Values were not printed.');
}

main();
