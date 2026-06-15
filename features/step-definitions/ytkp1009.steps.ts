import { Then, When } from '@cucumber/cucumber';
import {
  fillOperationDescription,
  openOperationCodeDropdown,
  openSubTypeDropdown,
  openTypeDropdown,
  selectOperationCode,
} from '../../src/actions/actions';
import {
  expectAutomaticParametersRouteOpened,
  expectOperationCodeListFormatted,
  expectOperationDescriptionMaxLengthAndTurkish,
  expectOperationDescriptionRequired,
  expectSubTypeAndKdvRateDisabled,
  expectSubTypeDisabledKdvRateEnabled,
  expectSubTypeEnabledKdvRateDisabled,
  expectSubTypeOptionsVisible,
  expectTypeOptionsVisible,
} from '../../src/assertions/assertions';
import { openAutomaticParametersCreatePage } from '../../src/flows/ytkp1009.flow';
import { CustomWorld, getPage } from '../support/world';

Then('Otomatik Parametre Tanımlama sayfasının açıldığı doğrulanır', async function (this: CustomWorld) {
  await expectAutomaticParametersRouteOpened(getPage(this));
});

When('Yeni kayıt oluşturma ekranına geçiş yapılır', async function (this: CustomWorld) {
  await openAutomaticParametersCreatePage(getPage(this));
});

When("İşlem Kodu dropdown'ı açılır", async function (this: CustomWorld) {
  await openOperationCodeDropdown(getPage(this));
});

Then('İşlem Kodu listesinin kod ve açıklama formatında listelendiği doğrulanır', async function (this: CustomWorld) {
  await expectOperationCodeListFormatted(getPage(this));
});

When('İşlem Kodu olarak {string} seçilir', async function (this: CustomWorld, optionText: string) {
  await selectOperationCode(getPage(this), optionText);
});

Then('Tür 2 alanının aktif, KDV Oranı alanının pasif olduğu doğrulanır', async function (this: CustomWorld) {
  await expectSubTypeEnabledKdvRateDisabled(getPage(this));
});

Then('Tür 2 ve KDV Oranı alanlarının pasif olduğu doğrulanır', async function (this: CustomWorld) {
  await expectSubTypeAndKdvRateDisabled(getPage(this));
});

Then('Tür 2 alanının pasif, KDV Oranı alanının aktif olduğu doğrulanır', async function (this: CustomWorld) {
  await expectSubTypeDisabledKdvRateEnabled(getPage(this));
});

When('Fiş Açıklama alanına {string} yazılır', async function (this: CustomWorld, value: string) {
  await fillOperationDescription(getPage(this), value);
});

Then('Fiş Açıklama alanının en fazla 15 karakter aldığı ve Türkçe karakteri koruduğu doğrulanır', async function (this: CustomWorld) {
  await expectOperationDescriptionMaxLengthAndTurkish(getPage(this));
});

Then('Fiş Açıklama alanının zorunlu olduğu doğrulanır', async function (this: CustomWorld) {
  await expectOperationDescriptionRequired(getPage(this));
});

When('Tür dropdown\'ı açılır', async function (this: CustomWorld) {
  await openTypeDropdown(getPage(this));
});

Then('Tür listesinde MERKEZ, BAŞMÜDÜRLÜK ve GENEL MÜDÜRLÜK seçeneklerinin listelendiği doğrulanır', async function (this: CustomWorld) {
  await expectTypeOptionsVisible(getPage(this));
});

When('Tür 2 dropdown\'ı açılır', async function (this: CustomWorld) {
  await openSubTypeDropdown(getPage(this));
});

Then('Tür 2 listesinde KDV-1, KDV-2, DAMGA, BSMV, KAMBİYO ve KONAKLAMA seçeneklerinin listelendiği doğrulanır', async function (this: CustomWorld) {
  await expectSubTypeOptionsVisible(getPage(this));
});
