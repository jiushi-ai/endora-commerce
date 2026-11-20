import { describe, expect, it } from 'vitest';
import type { InvoiceDetail } from '@endora-commerce/contracts';
import {
  headerSection,
  interpolate,
  lineItemsSection,
  money,
  totalsSection,
  unitMoney,
} from './sections.js';
import { sampleInvoiceDetail } from './sample.js';

/**
 * Owner ruling of 2026-10-25 (`specs/pricing/worked-examples.md` §10.18) — the
 * invoice's unit net price column shows up to four places (a Polish invoice
 * may: art. 106e ust. 1 pkt 9 names the unit price without prescribing its
 * precision); the line values and the totals keep two.
 */
describe('invoice PDF — unit net price', () => {
  it('shows a unit price with its significant places, up to four', () => {
    expect(unitMoney(0.0125)).toBe('0,0125');
    expect(unitMoney(1.505)).toBe('1,505');
    expect(unitMoney(1.5)).toBe('1,50');
    expect(unitMoney(1234.5)).toBe(money(1234.5));
  });

  it('the lines table prints the unit net price at four places and the line value at two', () => {
    const invoice = {
      lines: [
        { ordinal: 1, name: 'Screw', unit: 'szt.', quantity: 10_000, unitNetPrice: 0.0125, taxRate: 0.23, netValue: 125, grossValue: 153.75 },
      ],
    } as unknown as InvoiceDetail;
    const table = lineItemsSection(invoice) as { table: { body: Array<Array<{ text: string }>> } };
    const row = table.table.body[1]!.map((c) => c.text);
    expect(row).toContain('0,0125');
    expect(row).toContain(money(125));
  });
});

/**
 * Issue #428 point 2 — an invoice paid above its gross shows the amount due
 * clamped at 0 and the excess as an explicit overpayment, never a negative
 * amount due.
 */
describe('invoice PDF — overpayment', () => {
  const texts = (content: unknown): string[] =>
    ((content as { stack: Array<{ text: string }> }).stack ?? []).map((c) => c.text);

  it('prints the overpayment beside an amount due of 0', () => {
    const invoice = { ...sampleInvoiceDetail(), grossTotal: 2400, paidTotal: 2450, amountDue: 0, overpayment: 50 };
    const lines = texts(totalsSection(invoice, 'pl', { showAmountInWords: false }));
    expect(lines).toContain(`Do zapłaty: ${money(0)} USD`);
    expect(lines).toContain(`Nadpłata: ${money(50)} USD`);
  });

  it('ignores stock English chrome and keeps a true custom label (batch 45)', () => {
    const invoice = { ...sampleInvoiceDetail(), paidTotal: 2450, amountDue: 0, overpayment: 50 };
    // Stock EN "Overpayment" on a PL doc → localized Polish, not yellow-box English.
    expect(texts(totalsSection(invoice, 'pl', { labelOverpayment: 'Overpayment' }))).toContain(
      `Nadpłata: ${money(50)} USD`,
    );
    // Non-stock custom still wins.
    expect(texts(totalsSection(invoice, 'pl', { labelOverpayment: 'Acme overpay' }))).toContain(
      `Acme overpay: ${money(50)} USD`,
    );
    expect(texts(totalsSection(invoice, 'pl', { showOverpayment: false })).join('\n')).not.toContain('Nadpłata');
  });

  it('labels it in English on an English document', () => {
    const invoice = { ...sampleInvoiceDetail(), paidTotal: 2450, amountDue: 0, overpayment: 50 };
    expect(texts(totalsSection(invoice, 'en', {}))).toContain(
      `Overpayment: ${money(50, 'en-US')} USD`,
    );
  });

  it('prints no overpayment line when nothing was overpaid', () => {
    const lines = texts(totalsSection(sampleInvoiceDetail(), 'pl', {}));
    expect(lines.join('\n')).not.toContain('Nadpłata');
  });

  it('offers the overpayment as a merge field', () => {
    const invoice = { ...sampleInvoiceDetail(), overpayment: 50 };
    expect(interpolate('{{var invoice.overpayment}}', invoice)).toBe(money(50));
  });
});

/**
 * Batch 45 — seed/template stock English chrome must not paint yellow-box EN
 * on a zh-CN (or any non-EN) document; true custom labels still win.
 */
describe('invoice PDF — chrome labels vs document language (batch 45)', () => {
  const englishSeedChrome = {
    labelIssuedAt: 'Issue date',
    labelSaleDate: 'Sale date',
    labelPaymentDue: 'Payment due',
    labelPaymentMethod: 'Payment method',
    labelPaid: 'Paid',
    labelAmountDue: 'Amount due',
    labelGross: 'Total',
    labelInWords: 'In words',
  };

  const headerTexts = (content: unknown): string[] =>
    ((content as { table: { body: Array<Array<{ text: string }>> } }).table.body ?? []).map(
      (row) => row[0]!.text,
    );

  const totalsTexts = (content: unknown): string[] =>
    ((content as { stack: Array<{ text: string }> }).stack ?? []).map((c) => c.text);

  it('uses Chinese chrome when English seed props sit on a zh-CN document', () => {
    const invoice = sampleInvoiceDetail();
    const headers = headerTexts(headerSection(invoice, englishSeedChrome, {}, 'zh-CN'));
    expect(headers.some((t) => t.startsWith('开票日期:'))).toBe(true);

    const lines = totalsTexts(
      totalsSection(invoice, 'en', { ...englishSeedChrome, showAmountInWords: false }, 'zh-CN'),
    );
    expect(lines.some((t) => t.startsWith('已付:'))).toBe(true);
    expect(lines.some((t) => t.startsWith('应付金额:'))).toBe(true);
  });

  it('keeps a non-stock custom chrome label', () => {
    const invoice = sampleInvoiceDetail();
    const headers = headerTexts(
      headerSection(invoice, { labelIssuedAt: 'Acme issue day' }, {}, 'zh-CN'),
    );
    expect(headers.some((t) => t.startsWith('Acme issue day:'))).toBe(true);
  });
});
