"use strict";

function getStepStatus(testCase, pickleStepId, stepResults) {
  const testStep = testCase.testSteps.find(
    (step) => step.pickleStepId === pickleStepId
  );

  if (!testStep) {
    return "";
  }

  return stepResults.get(testStep.id) || "";
}

module.exports = {
  type: "formatter",
  formatter({ on, write }) {
    const pickles = new Map();
    const testCases = new Map();
    const startedTestCases = new Map();
    const stepResultsByAttempt = new Map();
    let hasOutput = false;

    on("message", (message) => {
      if (message.pickle) {
        pickles.set(message.pickle.id, message.pickle);
        return;
      }

      if (message.testCase) {
        testCases.set(message.testCase.id, message.testCase);
        return;
      }

      if (message.testCaseStarted) {
        startedTestCases.set(
          message.testCaseStarted.id,
          message.testCaseStarted.testCaseId
        );
        stepResultsByAttempt.set(message.testCaseStarted.id, new Map());
        return;
      }

      if (message.testStepFinished) {
        const stepResults = stepResultsByAttempt.get(
          message.testStepFinished.testCaseStartedId
        );

        if (stepResults) {
          stepResults.set(
            message.testStepFinished.testStepId,
            message.testStepFinished.testStepResult.status
          );
        }

        return;
      }

      if (!message.testCaseFinished || message.testCaseFinished.willBeRetried) {
        return;
      }

      const testCaseStartedId = message.testCaseFinished.testCaseStartedId;
      const testCaseId = startedTestCases.get(testCaseStartedId);
      const testCase = testCases.get(testCaseId);

      if (!testCase) {
        return;
      }

      const pickle = pickles.get(testCase.pickleId);

      if (!pickle) {
        return;
      }

      const stepResults = stepResultsByAttempt.get(testCaseStartedId) || new Map();

      if (hasOutput) {
        write("\n");
      }

      write(`${pickle.name}\n`);

      for (const step of pickle.steps) {
        const status = getStepStatus(testCase, step.id, stepResults);
        const suffix = status && status !== "PASSED" ? ` [${status}]` : "";

        write(`    ${step.text}${suffix}\n`);
      }

      hasOutput = true;
    });
  },
};
