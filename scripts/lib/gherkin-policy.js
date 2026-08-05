const TEST_CASE_ID_PATTERN = /^[A-Z][A-Z0-9]*(?:[-_]\d+)+(?=\b|\s|[-,:])/u;
const SCENARIO_PATTERN = /^\s*Scenario(?: Outline)?:\s*(.+?)\s*$/u;
const FEATURE_PATTERN = /^\s*Feature:\s*(.+?)\s*$/u;
const DISALLOWED_STEP_PATTERN = /^\s*(Given|When|Then|And|But)\s+(.+?)\s*$/u;

function createViolation(code, path, line, scenario, detail, message) {
  const context = scenario ?? '<feature>';
  return {
    code,
    detail,
    fingerprint: `${code}::${path}::${context}::${detail}`,
    line,
    message,
    path,
    scenario,
  };
}

function categoryForPath(path) {
  const match = path.match(/(?:^|\/)features\/cases\/(smoke|regression)\//u);
  return match?.[1];
}

function analyzeFeatureSource(source, path) {
  const violations = [];
  const lines = source.replace(/\r\n?/gu, '\n').split('\n');
  const category = categoryForPath(path);
  let featureTags = [];
  let pendingTags = [];
  let currentScenario;
  let scenarioCount = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed.startsWith('@')) {
      pendingTags.push(...trimmed.split(/\s+/u).filter((tag) => tag.startsWith('@')));
      continue;
    }

    const featureMatch = line.match(FEATURE_PATTERN);
    if (featureMatch) {
      featureTags = [...pendingTags];
      pendingTags = [];
      currentScenario = undefined;
      continue;
    }

    const scenarioMatch = line.match(SCENARIO_PATTERN);
    if (scenarioMatch) {
      const scenarioName = scenarioMatch[1];
      const effectiveTags = [...new Set([...featureTags, ...pendingTags])];
      pendingTags = [];
      currentScenario = scenarioName;
      scenarioCount += 1;

      if (!TEST_CASE_ID_PATTERN.test(scenarioName)) {
        violations.push(
          createViolation(
            'scenario-id',
            path,
            lineNumber,
            scenarioName,
            scenarioName,
            'Scenario name must start with an authoritative manual test case ID.',
          ),
        );
      }

      if (effectiveTags.length === 0) {
        violations.push(
          createViolation(
            'scenario-tags',
            path,
            lineNumber,
            scenarioName,
            scenarioName,
            'Scenario must inherit or declare at least one tag.',
          ),
        );
      }

      if (category && !effectiveTags.includes(`@${category}`)) {
        violations.push(
          createViolation(
            'category-tag',
            path,
            lineNumber,
            scenarioName,
            `@${category}`,
            `Scenario under ${category} must inherit or declare @${category}.`,
          ),
        );
      }

      continue;
    }

    const disallowedStepMatch = line.match(DISALLOWED_STEP_PATTERN);
    if (disallowedStepMatch) {
      const [, keyword, stepText] = disallowedStepMatch;
      violations.push(
        createViolation(
          'step-keyword',
          path,
          lineNumber,
          currentScenario,
          `${keyword} ${stepText}`,
          `Feature steps must use "*" instead of "${keyword}".`,
        ),
      );
    }
  }

  if (scenarioCount === 0) {
    violations.push(
      createViolation(
        'missing-scenario',
        path,
        1,
        undefined,
        path,
        'Feature file must contain at least one scenario.',
      ),
    );
  }

  if (!category) {
    violations.push(
      createViolation(
        'feature-location',
        path,
        1,
        undefined,
        path,
        'Feature file must be under features/cases/smoke or features/cases/regression.',
      ),
    );
  }

  return violations;
}

function compareWithBaseline(violations, baselineEntries) {
  const baselineFingerprints = new Set(baselineEntries.map((entry) => entry.fingerprint));
  const violationFingerprints = new Set(violations.map((violation) => violation.fingerprint));

  return {
    accepted: violations.filter((violation) => baselineFingerprints.has(violation.fingerprint)),
    newViolations: violations.filter(
      (violation) => !baselineFingerprints.has(violation.fingerprint),
    ),
    staleBaseline: baselineEntries.filter((entry) => !violationFingerprints.has(entry.fingerprint)),
  };
}

function validateBaselineEntries(entries) {
  const errors = [];
  const seen = new Set();

  for (const entry of entries) {
    if (!entry || typeof entry.fingerprint !== 'string' || entry.fingerprint.length === 0) {
      errors.push('Every baseline entry must contain a non-empty fingerprint.');
      continue;
    }

    if (typeof entry.reason !== 'string' || entry.reason.trim().length === 0) {
      errors.push(`Baseline entry ${entry.fingerprint} must explain its reason.`);
    }

    if (seen.has(entry.fingerprint)) {
      errors.push(`Duplicate baseline entry: ${entry.fingerprint}`);
    }
    seen.add(entry.fingerprint);
  }

  return errors;
}

module.exports = {
  analyzeFeatureSource,
  categoryForPath,
  compareWithBaseline,
  validateBaselineEntries,
};
