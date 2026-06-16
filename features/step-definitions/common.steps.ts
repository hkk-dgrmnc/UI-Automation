import { DataTable, Then } from '@cucumber/cucumber';
import { expectListboxOptionsVisible } from '../../src/assertions/assertions';
import { CustomWorld, getPage } from '../support/world';

// Generic liste dogrulama: acik bir dropdown'da beklenen seceneklerin listelendigini
// dogrular. Beklenen secenekler feature Data Table'indan gelir; sayfa-ozel secenek
// listesi koda gomulmez. Tum dropdown'larda (Tür, Tür 2, ...) tekrar kullanilir.
// "{string}" listenin adidir; rapor okunabilirligi icin step metninde tutulur,
// locator zaten o anda acik olan listbox'i hedefler.
Then(
  '{string} listesinde aşağıdaki seçenekler listelenir',
  async function (this: CustomWorld, _listName: string, table: DataTable) {
    const expectedOptions = table.raw().map((row) => row[0]);
    await expectListboxOptionsVisible(getPage(this), expectedOptions);
  },
);
