const { readFileSync, writeFileSync } = require('node:fs');
const { spawnSync } = require('node:child_process');

const CLAUDE_MODEL = 'opus';
const CLAUDE_EFFORT = 'xhigh';
const CLAUDE_WORKFLOW = 'UltraCode';
const DEFAULT_TIMEOUT_MS = 900000;
const DIAGNOSTIC_TIMEOUT_MS = 45000;

function printUsageAndExit(exitCode = 2) {
  console.error(
    [
      'Usage:',
      '  node scripts/claude-review.js --input <file> [--output <file>] [--timeout-ms <ms>]',
      '  Get-Content review-context.md | node scripts/claude-review.js',
      '  node scripts/claude-review.js --self-test',
    ].join('\n'),
  );
  process.exit(exitCode);
}

function parseArgs(argv) {
  const args = {
    input: undefined,
    output: undefined,
    selfTest: false,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--input') {
      args.input = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === '--output') {
      args.output = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === '--timeout-ms') {
      args.timeoutMs = Number(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--self-test') {
      args.selfTest = true;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      printUsageAndExit(0);
    }

    console.error(`Unknown argument: ${arg}`);
    printUsageAndExit();
  }

  if (!Number.isFinite(args.timeoutMs) || args.timeoutMs <= 0) {
    console.error('--timeout-ms must be a positive number.');
    process.exit(2);
  }

  return args;
}

function readStdin() {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function readReviewContext(inputPath) {
  const context = inputPath ? readFileSync(inputPath, 'utf8') : readStdin();

  if (!context.trim()) {
    console.error('Claude review context is empty.');
    printUsageAndExit();
  }

  return context;
}

function buildPrompt(context) {
  return [
    'Bu repo icin read-only reviewer rolundesin.',
    '',
    `Calisma akli: ${CLAUDE_MODEL} model + ${CLAUDE_EFFORT} effort + ${CLAUDE_WORKFLOW} workflow.`,
    `${CLAUDE_WORKFLOW} workflow: en ust seviye code-review disiplini uygula; once blocker riskleri, sonra mimari/reuse uyumu, sonra assertion/locator/test stabilitesi, en sonda net karar ver.`,
    'Derin inceleme yap ama ham gizli dusunce yazma; sadece kanitli sonuc, itiraz ve onerileri raporla.',
    '',
    'Kesin kurallar:',
    '- Dosya degistirme.',
    '- Kod yazma veya patch uretme.',
    '- Browser/MCP kullanma.',
    '- Writer Codex tir; sen sadece reviewer/itiraz eden mimarsin.',
    '- AGENTS.md mimarisi, INVENTORY reuse sozlugu, duplicate riski, locator guvenilirligi, assertion kalitesi ve expected-result kapsamini denetle.',
    '- Yeni step/action/assertion/locator gercekten gerekli mi denetle; mevcut generic/dynamic step veya reusable parca parametreyle kullanilabiliyorsa sayfaya ozel yeni parca icin itiraz et.',
    '- Sayfaya ozel yazilmis step common/navigation generic step olarak tasarlanabiliyorsa veya expected data feature Data Table ile verilebilecekken koda gomulmusse bunu BLOCKER ya da NON-BLOCKER olarak raporla.',
    '- Ham gizli dusunce yazma; sadece kanitli review sonucu ver.',
    '',
    'Cikti formati:',
    'BLOCKER:',
    '- yok veya net blocker maddeleri',
    '',
    'NON-BLOCKER:',
    '- iyilestirme / dikkat notlari',
    '',
    'RECOMMENDATION:',
    '- APPROVE / REVISE / BLOCK',
    '',
    'Review context:',
    context,
  ].join('\n');
}

function buildClaudeArgs() {
  return [
    '-p',
    '--model',
    CLAUDE_MODEL,
    '--effort',
    CLAUDE_EFFORT,
    '--permission-mode',
    'plan',
    '--disallowedTools',
    'Bash,Edit,Write',
    '--no-session-persistence',
    '--output-format',
    'text',
  ];
}

function buildCommand(baseArgs) {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'claude';
  const commandArgs =
    process.platform === 'win32' ? ['/d', '/s', '/c', 'claude.cmd', ...baseArgs] : baseArgs;

  return { command, commandArgs };
}

function runClaudeRaw(prompt, timeoutMs) {
  const { command, commandArgs } = buildCommand(buildClaudeArgs());

  return spawnSync(command, commandArgs, {
    input: prompt,
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 1024 * 1024 * 5,
  });
}

function getOutput(result) {
  return [result.stdout, result.stderr]
    .filter(Boolean)
    .map((part) => part.trim())
    .filter(Boolean)
    .join('\n')
    .trim();
}

function classifyFailure(result, timeoutMs) {
  const output = getOutput(result);

  if (result.error?.code === 'ETIMEDOUT') {
    return `Claude review timed out after ${Math.round(timeoutMs / 1000)} seconds.`;
  }

  if (result.error) {
    return `Claude review failed: ${result.error.message}`;
  }

  if (/(session limit|usage limit|rate limit)/i.test(output)) {
    return `Claude review unavailable because of Claude session/usage limit.\n${output}`;
  }

  if (/(not logged in|login required|authentication|api key|unauthorized)/i.test(output)) {
    return `Claude review unavailable because Claude authentication is not ready.\n${output}`;
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    return `Claude review failed with exit code ${result.status}.\n${output}`;
  }

  if (!output) {
    return 'Claude review produced no readable output.';
  }

  return undefined;
}

function runDiagnostic() {
  const result = runClaudeRaw('Saglik kontrolu. Sadece "OK" yaz.', DIAGNOSTIC_TIMEOUT_MS);
  const failure = classifyFailure(result, DIAGNOSTIC_TIMEOUT_MS);

  if (failure) {
    return `Diagnostic failed: ${failure}`;
  }

  return `Diagnostic passed: ${getOutput(result)}`;
}

function failWithClaudeResult(result, timeoutMs, runExtraDiagnostic = false) {
  const failure = classifyFailure(result, timeoutMs);
  console.error(failure ?? 'Claude review failed.');

  if (runExtraDiagnostic) {
    console.error(runDiagnostic());
  }

  process.exit(1);
}

function runClaude(prompt, timeoutMs) {
  const result = runClaudeRaw(prompt, timeoutMs);
  const failure = classifyFailure(result, timeoutMs);
  if (failure) {
    failWithClaudeResult(result, timeoutMs, result.error?.code === 'ETIMEDOUT');
  }

  return result.stdout.trim();
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.selfTest) {
    const diagnostic = runDiagnostic();
    if (diagnostic.startsWith('Diagnostic failed:')) {
      console.error(diagnostic);
      process.exit(1);
    }

    console.log(diagnostic);
    return;
  }

  const context = readReviewContext(args.input);
  const prompt = buildPrompt(context);
  const review = runClaude(prompt, args.timeoutMs);

  if (args.output) {
    writeFileSync(args.output, `${review}\n`, 'utf8');
  }

  console.log(review);
}

main();
