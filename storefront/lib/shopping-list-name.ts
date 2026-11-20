import type { tForLocale } from './i18n/messages';

/**
 * Stored name the platform writes on the auto-created default shopping list
 * (issue #751 / upstream `SHOPPING_LIST_AUTO_DEFAULT_NAME`). Presentation may
 * localise it; the DB value stays English.
 */
export const SHOPPING_LIST_AUTO_DEFAULT_NAME = 'Default';

/**
 * Whether `list` is the platform default that nobody has renamed — show it in
 * the shop language instead of the stored English name (upstream
 * `isAutoDefaultShoppingList`; kept local until contracts ports the helper).
 */
export function isAutoDefaultShoppingList(list: {
  readonly name: string;
  readonly isDefault: boolean;
}): boolean {
  return list.isDefault && list.name === SHOPPING_LIST_AUTO_DEFAULT_NAME;
}

/**
 * Shopping-list name as the storefront shows it: auto-default → catalogue;
 * any other list → the name the customer gave it. Presentation only.
 */
export function shoppingListDisplayName(
  list: { readonly name: string; readonly isDefault: boolean },
  t: ReturnType<typeof tForLocale>,
): string {
  return isAutoDefaultShoppingList(list) ? t('account.lists.autoDefaultName') : list.name;
}
