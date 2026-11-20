import { describe, expect, it } from 'vitest';
import { invoicePdfLabels } from './invoice-pdf-labels.js';

describe('invoicePdfLabels (batch 44)', () => {
  it('returns Polish titles for pl-PL (historical default)', () => {
    expect(invoicePdfLabels('pl-PL').titles.invoice).toBe('Faktura');
    expect(invoicePdfLabels(null).titles.invoice).toBe('Faktura');
  });

  it('returns English titles for en-US', () => {
    expect(invoicePdfLabels('en-US').titles.invoice).toBe('Invoice');
    expect(invoicePdfLabels('en-US').colName).toBe('Name');
  });

  it('returns Simplified Chinese for zh-CN', () => {
    expect(invoicePdfLabels('zh-CN').titles.invoice).toBe('发票');
    expect(invoicePdfLabels('zh-CN').sellerLabel).toBe('卖方');
  });

  it('returns Traditional Chinese for zh-TW', () => {
    expect(invoicePdfLabels('zh-TW').titles.invoice).toBe('發票');
    expect(invoicePdfLabels('zh-Hant-TW').titles.invoice).toBe('發票');
  });

  it('falls back to English for an unknown tag', () => {
    expect(invoicePdfLabels('de-DE').titles.invoice).toBe('Invoice');
  });
});
