import { Then, When } from '@cucumber/cucumber';
import { expectAutomaticParametersRouteOpened } from '../../src/assertions/assertions';
import { openAutomaticParametersCreatePage } from '../../src/flows/ytkp1009.flow';
import { CustomWorld, getPage } from '../support/world';

Then('Otomatik Parametre Tanımlama sayfasının açıldığı doğrulanır', async function (this: CustomWorld) {
  await expectAutomaticParametersRouteOpened(getPage(this));
});

When('Yeni kayıt oluşturma ekranına geçiş yapılır', async function (this: CustomWorld) {
  await openAutomaticParametersCreatePage(getPage(this));
});
