# Snapshot v1 - Current Cucumber Playwright Project

Date: 2026-06-04

## Purpose

This snapshot records the current project state after removing Gauge-like concept usage and settling on a simple Cucumber + Playwright TypeScript best-practice structure.

## Snapshot Name

Current Project Snapshot - v1

## Project State

- Cucumber is the main test runner.
- Playwright is used for browser automation and web-first assertions.
- Feature files use `*` as the standard Gherkin step keyword.
- Runtime step definition files use `defineStep as Step`.
- VS Code uses an editor-only glue file so the Cucumber extension can resolve steps without changing runtime step style.
- Gauge runner, `.cpt` concepts, and concept expansion tooling are not used.
- Native Playwright spec files are not used.
- Classic Page Object Model classes are not used.
- Empty scaffold folders are not kept.

## Active Structure

```text
.vscode/
  cucumber-editor-glue.ts
  extensions.json
  settings.json

features/
  generated/
    TC_001_login.feature
  step-definitions/
    auth.steps.ts
  support/
    grouped-test-result-formatter.js
    hooks.ts
    world.ts

src/
  actions/
    actions.ts
  assertions/
    assertions.ts
  config/
    env.ts
  data/
    data.ts
  flows/
    auth.flow.ts
  locators/
    locators.ts
```

## Key Files

```text
AGENTS.md
cucumber.js
package.json
tsconfig.json
.gitignore
.env.example
```

## Active Test

```text
features/generated/TC_001_login.feature
```

Current feature style:

```gherkin
@smoke @auth
Feature: Authentication login

  Scenario: TC_001 - Kullanici gecerli bilgilerle login olur
    * kullanici login ekranini acar
    * Kullanici gecerli bilgilerle giris yapar
    * kullanici basarili sekilde login olur
```

Current runtime step definition style:

```ts
import { defineStep as Step } from '@cucumber/cucumber';

Step('Kullanici gecerli bilgilerle giris yapar', async function (this: CustomWorld) {
  await submitLogin(getPage(this), users.validUser);
});
```

Editor-only glue:

```text
.vscode/cucumber-editor-glue.ts
```

This file exists only for VS Code Cucumber language-server diagnostics. It is not loaded by `cucumber.js` at runtime.

## Cucumber Config

```text
cucumber.js
```

- Loads `ts-node/register`.
- Loads runtime support from `features/support/**/*.ts`.
- Loads runtime step definitions from `features/step-definitions/**/*.ts`.
- Writes grouped console output, HTML report, and JSON report.

## Main Commands

```text
npm.cmd test
npm.cmd test -- features/generated/TC_001_login.feature:4
npm.cmd run typecheck
npm.cmd run test:chromium
npm.cmd run test:firefox
npm.cmd run test:webkit
npm.cmd run test:all
npm.cmd run test:headed
npm.cmd run test:debug
```

## Environment

Sensitive and environment-specific values are stored in `.env`.

Example values are documented in:

```text
.env.example
```

Important environment values:

```text
BASE_URL
BROWSER
HEADED
VALID_USER_USERNAME or VALID_USER_EMAIL
VALID_USER_PASSWORD
```

## Verification

The following checks were completed successfully before this snapshot:

```text
npm.cmd run typecheck
npm.cmd test -- features/generated/TC_001_login.feature:4
```
