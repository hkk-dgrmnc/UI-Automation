import { Then } from '@cucumber/cucumber';
import {
  expectAddressTemplateCreatePageOpened,
  expectAddressTemplatesPageOpened,
} from '../../src/assertions/addressTemplates.assertions';
import { CustomWorld, getPage } from '../support/world';

Then('Adres Şablonu sayfasının açıldığı doğrulanır', async function (this: CustomWorld) {
  await expectAddressTemplatesPageOpened(getPage(this));
});

Then('Adres Şablonu oluşturma ekranının açıldığı doğrulanır', async function (this: CustomWorld) {
  await expectAddressTemplateCreatePageOpened(getPage(this));
});
