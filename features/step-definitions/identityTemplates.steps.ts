import { Then } from '@cucumber/cucumber';
import { expectIdentityTemplatesPageOpened } from '../../src/assertions/identityTemplates.assertions';
import { CustomWorld, getPage } from '../support/world';

Then('Kimlik Şablonu sayfasının açıldığı doğrulanır', async function (this: CustomWorld) {
  await expectIdentityTemplatesPageOpened(getPage(this));
});
