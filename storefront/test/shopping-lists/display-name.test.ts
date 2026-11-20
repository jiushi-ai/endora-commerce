import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { tForLocale } from '../../lib/i18n/messages';
import {
  isAutoDefaultShoppingList,
  shoppingListDisplayName,
} from '../../lib/shopping-list-name';

/**
 * Batch 51 — auto-default display name + Delete button i18n wiring.
 */

describe('shoppingListDisplayName', () => {
  it('localises the unrenamed platform default list', () => {
    const list = { name: 'Default', isDefault: true };
    expect(isAutoDefaultShoppingList(list)).toBe(true);
    expect(shoppingListDisplayName(list, tForLocale('zh-CN'))).toBe('默认');
    expect(shoppingListDisplayName(list, tForLocale('pl-PL'))).toBe('Domyślna');
  });

  it('keeps customer-authored names untouched', () => {
    expect(
      shoppingListDisplayName(
        { name: '26-11-15号XX清单', isDefault: false },
        tForLocale('zh-CN'),
      ),
    ).toBe('26-11-15号XX清单');
    expect(
      shoppingListDisplayName({ name: 'Default', isDefault: false }, tForLocale('zh-CN')),
    ).toBe('Default');
  });
});

describe('shopping-lists page wires delete i18n', () => {
  it('passes locale and display name into DeleteShoppingListButton', () => {
    const src = readFileSync(
      resolve(import.meta.dirname, '../../app/(account)/shopping-lists/page.tsx'),
      'utf8',
    );
    expect(src).toContain('shoppingListDisplayName(l, t)');
    expect(src).toContain('locale={locale}');
    expect(src).toContain('listName={shoppingListDisplayName(l, t)}');
  });

  it('DeleteShoppingListButton reads catalogue keys via tForLocale', () => {
    const src = readFileSync(
      resolve(
        import.meta.dirname,
        '../../components/shopping-lists/DeleteShoppingListButton.tsx',
      ),
      'utf8',
    );
    expect(src).toContain("t('account.lists.delete.button')");
    expect(src).not.toMatch(/>\s*Delete\s*</);
  });
});
