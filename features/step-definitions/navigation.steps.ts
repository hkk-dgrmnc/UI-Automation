import { Then, When } from '@cucumber/cucumber';
import { clickSidebarMenuLink, openSidebarMenuPath } from '../../src/actions/navigation.actions';
import { expectSelectedSidebarMenu } from '../../src/assertions/navigation.assertions';
import { CustomWorld, getPage } from '../support/world';

When('{string} menü yolundan sayfaya gidilir', async function (this: CustomWorld, menuPath: string) {
  const parts = menuPath.split(' > ');
  const linkName = parts[parts.length - 1];
  const parentNames = parts.slice(0, -1);
  await openSidebarMenuPath(getPage(this), parentNames, linkName);
  await clickSidebarMenuLink(getPage(this), linkName);
});

Then('{string} menüsünün seçili olduğu doğrulanır', async function (this: CustomWorld, menuName: string) {
  await expectSelectedSidebarMenu(getPage(this), menuName);
});
