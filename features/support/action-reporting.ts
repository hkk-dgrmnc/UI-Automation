import { setDefinitionFunctionWrapper } from '@cucumber/cucumber';
import { runWithActionReport } from '../../src/utils/action-report';
import { CustomWorld } from './world';

type StepDefinitionCode = (this: CustomWorld, ...args: unknown[]) => unknown;

setDefinitionFunctionWrapper((code: StepDefinitionCode) => {
  return async function actionReportingWrapper(this: CustomWorld, ...args: unknown[]) {
    return runWithActionReport(
      (data, mediaType) => this.attach(data, mediaType),
      async () => code.apply(this, args),
    );
  };
});
