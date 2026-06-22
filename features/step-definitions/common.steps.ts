import { DataTable, Then } from '@cucumber/cucumber';
import { expectListboxOptionsVisible } from '../../src/assertions/common.assertions';
import { CustomWorld, getPage } from '../support/world';

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
