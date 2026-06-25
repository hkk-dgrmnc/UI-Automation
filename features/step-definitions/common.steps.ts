import { DataTable, Then, When } from '@cucumber/cucumber';
import { clickCreateLink, openDropdown, selectDropdownOption } from '../../src/actions/common.actions';
import {
  expectButtonVisible,
  expectHeadingVisible,
  expectInputFieldsVisible,
  expectListboxOptionsVisible,
  expectTableColumnHeadersVisible,
} from '../../src/assertions/common.assertions';
import { CustomWorld, getPage } from '../support/world';

When('{string} dropdown\'ı açılır', async function (this: CustomWorld, dropdownName: string) {
  await openDropdown(getPage(this), dropdownName);
});

When('{string} dropdownından {string} seçilir', async function (
  this: CustomWorld,
  dropdownName: string,
  optionText: string,
) {
  await selectDropdownOption(getPage(this), dropdownName, optionText);
});

When('Oluştur butonuna tıklanır', async function (this: CustomWorld) {
  await clickCreateLink(getPage(this));
});

// Generic liste dogrulama: acik bir dropdown'da beklenen seceneklerin listelendigini
// dogrular. Beklenen secenekler feature Data Table'indan gelir; sayfa-ozel secenek
// listesi koda gomulmez. Tum dropdown'larda (Tür, Tür 2, ...) tekrar kullanilir.
// "{string}" listenin adidir ve listeyi DARALTMAK icin kullanilir: combobox bu adla
// bulunur, aria-controls'u ile sadece o anki ACIK listbox'i hedefler (AGENTS.md 9.1).
Then(
  '{string} listesinde aşağıdaki seçenekler listelenir',
  async function (this: CustomWorld, listName: string, table: DataTable) {
    const expectedOptions = table.raw().map((row) => row[0]);
    await expectListboxOptionsVisible(getPage(this), listName, expectedOptions);
  },
);

Then('{string} başlığı görüldüğü doğrulanır', async function (this: CustomWorld, headingText: string) {
  await expectHeadingVisible(getPage(this), headingText);
});

Then(
  'Tabloda aşağıdaki kolon başlıkları listelenir',
  async function (this: CustomWorld, table: DataTable) {
    const expectedHeaders = table.raw().map((row) => row[0]);
    await expectTableColumnHeadersVisible(getPage(this), expectedHeaders);
  },
);

Then(
  'Sayfada aşağıdaki input alanları görüntülenir',
  async function (this: CustomWorld, table: DataTable) {
    const expectedFields = table.raw().map((row) => row[0]);
    await expectInputFieldsVisible(getPage(this), expectedFields);
  },
);

Then('{string} butonu görüldüğü doğrulanır', async function (this: CustomWorld, buttonName: string) {
  await expectButtonVisible(getPage(this), buttonName);
});
