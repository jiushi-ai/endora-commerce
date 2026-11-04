import { describe, expect, it } from 'vitest';
import { BIDDING_SETTING_CODES, manifest } from './manifest.js';

/**
 * Off-state coverage (T25): operator activation is declared so the kernel can
 * gate routes/ports when bidding is switched off.
 */
describe('bidding manifest activation (T25)', () => {
  it('declares an operator-toggleable activation setting', () => {
    expect(manifest.activation?.settingCode).toBe(BIDDING_SETTING_CODES.ACTIVATION);
    expect(manifest.activation?.default).toBe(true);
  });

  it('depends on carts/orders/quick_order for real convert (T17′)', () => {
    expect(manifest.dependencies).toEqual(
      expect.arrayContaining(['carts', 'orders', 'quick_order', 'catalog', 'customer_accounts']),
    );
  });
});
