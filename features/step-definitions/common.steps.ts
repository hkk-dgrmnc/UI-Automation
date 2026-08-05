import { DataTable, Then, When } from '@cucumber/cucumber';
import { clickButtonByName } from '../../src/actions/control.actions';
import { openDropdown, selectDropdownOption } from '../../src/actions/dropdown.actions';
import { fillInputFieldByName } from '../../src/actions/form.actions';
import { clickTableColumnValue } from '../../src/actions/table.actions';
import { collectVisibleBusinessTexts } from '../../src/actions/uiAudit.actions';
import { expectHeadingVisible } from '../../src/assertions/common.assertions';
import {
  expectButtonNotVisible,
  expectButtonVisible,
} from '../../src/assertions/control.assertions';
import {
  expectDropdownFieldSelectedValue,
  expectDropdownFieldsVisible,
  expectListboxOptionsVisible,
} from '../../src/assertions/dropdown.assertions';
import {
  expectInputFieldValue,
  expectInputFieldValueLengthLessThanOrEqual,
  expectInputFieldsVisible,
} from '../../src/assertions/form.assertions';
import {
  expectTableColumnHeadersVisible,
  expectTableColumnValuesVisible,
} from '../../src/assertions/table.assertions';
import { COLORS as C, INDENT } from '../../src/utils/console-format';
import { CustomWorld, getPage } from '../support/world';

When("{string} dropdown'ı açılır", async function (this: CustomWorld, dropdownName: string) {
  await openDropdown(getPage(this), dropdownName);
});

When(
  '{string} dropdownından {string} seçilir',
  async function (this: CustomWorld, dropdownName: string, optionText: string) {
    await selectDropdownOption(getPage(this), dropdownName, optionText);
  },
);

When('{string} butonuna tıklanır', async function (this: CustomWorld, buttonName: string) {
  await clickButtonByName(getPage(this), buttonName);
});

When(
  '{string} input alanına {string} değeri yazılır',
  async function (this: CustomWorld, fieldName: string, value: string) {
    await fillInputFieldByName(getPage(this), fieldName, value);
  },
);

Then(
  '{string} input alanına {string} değeri yazıldığı doğrulanır',
  async function (this: CustomWorld, fieldName: string, value: string) {
    await expectInputFieldValue(getPage(this), fieldName, value);
  },
);

When(
  'Tablonun {string} isimli kolon başlığının altındaki {string} değere tıklanır',
  async function (this: CustomWorld, columnName: string, value: string) {
    await clickTableColumnValue(getPage(this), columnName, value);
  },
);

// Generic liste dogrulama: acik bir dropdown'da beklenen seceneklerin listelendigini
// dogrular. Beklenen secenekler feature Data Table'indan gelir; sayfa-ozel secenek
// listesi koda gomulmez. Tum dropdown'larda (Tür, Tür 2, ...) tekrar kullanilir.
// "{string}" listenin adidir ve listeyi DARALTMAK icin kullanilir: combobox bu adla
// bulunur, aria-controls'u ile sadece o anki ACIK listbox'i hedefler (AGENTS.md 9.1).
Then(
  '{string} dropdown listesinde aşağıdaki seçenekler listelenir',
  async function (this: CustomWorld, listName: string, table: DataTable) {
    const expectedOptions = table.raw().map((row) => row[0]);
    await expectListboxOptionsVisible(getPage(this), listName, expectedOptions);
  },
);

Then(
  '{string} başlığı görüldüğü doğrulanır',
  async function (this: CustomWorld, headingText: string) {
    await expectHeadingVisible(getPage(this), headingText);
  },
);

Then(
  'Tabloda aşağıdaki kolon başlıkları listelenir',
  async function (this: CustomWorld, table: DataTable) {
    const expectedHeaders = table.raw().map((row) => row[0]);
    await expectTableColumnHeadersVisible(getPage(this), expectedHeaders);
  },
);

Then(
  'Tablonun {string} isimli kolon başlığının altında aşağıdaki değerler listelenir',
  async function (this: CustomWorld, columnName: string, table: DataTable) {
    const expectedValues = table.raw().map((row) => row[0].trim());
    await expectTableColumnValuesVisible(getPage(this), columnName, expectedValues);
  },
);

Then(
  'Sayfada aşağıdaki input alanları görüntülenir',
  async function (this: CustomWorld, table: DataTable) {
    const expectedFields = table.raw().map((row) => row[0]);
    await expectInputFieldsVisible(getPage(this), expectedFields);
  },
);

Then(
  'Sayfada aşağıdaki dropdown alanları görüntülenir',
  async function (this: CustomWorld, table: DataTable) {
    const expectedFields = table.raw().map((row) => row[0]);
    await expectDropdownFieldsVisible(getPage(this), expectedFields);
  },
);

Then(
  '{string} dropdownında {string} değeri seçili olduğu doğrulanır',
  async function (this: CustomWorld, fieldName: string, expectedValue: string) {
    await expectDropdownFieldSelectedValue(getPage(this), fieldName, expectedValue);
  },
);

Then(
  '{string} input alanında girilen karakter sayısı {int} değerinden küçük veya eşit olduğu doğrulanır',
  async function (this: CustomWorld, fieldName: string, maxLength: number) {
    await expectInputFieldValueLengthLessThanOrEqual(getPage(this), fieldName, maxLength);
  },
);

Then(
  '{string} butonu görüldüğü doğrulanır',
  async function (this: CustomWorld, buttonName: string) {
    await expectButtonVisible(getPage(this), buttonName);
  },
);

Then(
  '{string} butonunun görülmediği doğrulanır',
  async function (this: CustomWorld, buttonName: string) {
    await expectButtonNotVisible(getPage(this), buttonName);
  },
);

Then(
  'Bulunulan sayfanın görünen iş içerikleri dil kontrolü için raporlanır',
  async function (this: CustomWorld) {
    const audit = await collectVisibleBusinessTexts(getPage(this));
    const reportLines = [
      'Görünen İş İçeriği Dil Kontrolü',
      `Route: ${audit.route}`,
      `Scope: ${audit.scope}`,
      `Satır sayısı: ${audit.lines.length}`,
      '',
      ...audit.lines.map((line, index) => `${index + 1}. ${line}`),
    ];

    console.log(
      `${INDENT}${C.bold}${C.yellow}  AUDIT ${C.reset}  ${C.bold}Görünen İş İçeriği${C.reset}`,
    );
    for (const line of reportLines.slice(1)) {
      console.log(`${INDENT}         ${C.dim}${line}${C.reset}`);
    }

    await this.attach(reportLines.join('\n'), 'text/plain');
  },
);
