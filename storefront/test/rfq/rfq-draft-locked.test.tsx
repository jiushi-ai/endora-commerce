import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  DraftLine,
  LockedPricingNote,
  buildSubmitItems,
  strings,
} from '../../components/rfq/RfqDraftView';
import type { RfqDraftItem } from '../../lib/rfqDraft';

/**
 * Feature 146, US4 — a buyer whose price negotiation is locked (FR-021).
 *
 * `RfqDraftView` reads its lines from `localStorage` in an effect, so a server
 * render of the whole view shows an empty draft and would pass vacuously. The
 * three units the lock reaches are therefore tested on their own: the line,
 * the submit payload and the page-level note.
 *
 * The proposed-price input is found by its accessible name, not by
 * `type="number"` — the quantity stepper carries one too.
 */
const line: RfqDraftItem = {
  productId: 'prod-1',
  slug: 'widget',
  name: 'Widget',
  unitPrice: { amount: 120, currency: 'PLN' },
  proposedUnitPrice: 99.5,
  quantity: 2,
};

function renderLine(input: { locale: string; allowed: boolean; item?: RfqDraftItem }): string {
  return renderToString(
    <DraftLine
      line={input.item ?? line}
      t={strings(input.locale)}
      locale={input.locale}
      proposalsAllowed={input.allowed}
      onQty={(): void => undefined}
      onProposedPrice={(): void => undefined}
      onRemove={(): void => undefined}
    />,
  );
}

describe('DraftLine — proposals allowed (US4 #1)', () => {
  it.each([
    ['pl-PL', 'Proponowana cena'],
    ['en-US', 'Proposed price'],
  ])('shows the proposed-price input (%s)', (locale, label) => {
    const html = renderLine({ locale, allowed: true });
    expect(html).toContain(`aria-label="${label}"`);
    expect(html).toContain('value="99.5"');
  });
});

describe('DraftLine — proposals locked (US4 #2, FR-021)', () => {
  it.each([
    ['pl-PL', 'Proponowana cena', 'Cena katalogowa'],
    ['en-US', 'Proposed price', 'Catalogue price'],
  ])('hides the input and shows the catalogue price read-only (%s)', (locale, inputLabel, readOnlyLabel) => {
    const html = renderLine({ locale, allowed: false });
    expect(html).not.toContain(`aria-label="${inputLabel}"`);
    expect(html).not.toContain('value="99.5"');
    expect(html).toContain(readOnlyLabel);
    // The line total is built from the catalogue price, never from the
    // stored proposal the request will not carry: 2 × 120 = 240.
    expect(html).toContain('240');
    expect(html).not.toContain('199');
  });

  it('says "price on request" where the catalogue carries no price', () => {
    const html = renderLine({
      locale: 'en-US',
      allowed: false,
      item: { ...line, unitPrice: null },
    });
    expect(html).not.toContain('aria-label="Proposed price"');
    expect(html).toContain('Price on request');
  });
});

describe('buildSubmitItems (FR-021)', () => {
  const items: RfqDraftItem[] = [
    line,
    { productId: 'prod-2', slug: 'gadget', name: 'Gadget', unitPrice: null, quantity: 1 },
  ];

  it('sends the stored proposals when proposals are allowed', () => {
    expect(buildSubmitItems(items, true)).toEqual([
      { productId: 'prod-1', quantity: 2, desiredUnitPrice: 99.5 },
      { productId: 'prod-2', quantity: 1 },
    ]);
  });

  it('sends no proposal on any line when proposals are locked', () => {
    const sent = buildSubmitItems(items, false);
    expect(sent).toEqual([
      { productId: 'prod-1', quantity: 2 },
      { productId: 'prod-2', quantity: 1 },
    ]);
    for (const item of sent) expect('desiredUnitPrice' in item).toBe(false);
  });

  it('leaves the draft lines it was given untouched', () => {
    buildSubmitItems(items, false);
    expect(items[0]?.proposedUnitPrice).toBe(99.5);
  });
});

describe('LockedPricingNote', () => {
  it.each([
    ['pl-PL', 'Ceny w tym zapytaniu ustali dział sprzedaży'],
    ['en-US', 'Our sales team will set the prices for this request'],
    ['zh-CN', '本请求的价格由销售团队设定'],
    ['zh-TW', '本請求的價格由銷售團隊設定'],
  ])('tells the buyer that sales will price the request (%s)', (locale, sentence) => {
    const html = renderToString(<LockedPricingNote t={strings(locale)} />);
    expect(html).toContain(sentence);
  });
});
