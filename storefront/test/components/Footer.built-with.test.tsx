import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Footer } from '../../components/Footer';

/**
 * Batch 21 — footer platform strip matches Admin: Mobii logo + locale title
 * (no Endora "Built with" credit).
 *
 * Batch 63 — Shop L1 categories from props; no invoices/credit-limit; Terms /
 * Privacy / Cookies hidden while those routes 404.
 *
 * Batch 64 — Mobii Green Energy copyright; Support greys out non-Contact;
 * newsletter posts to /newsletter/subscribe; blurb uses category names.
 */
describe('Footer — Mobii platform brand strip', () => {
  it('shows Mobii mark + English platform title', () => {
    const html = renderToString(<Footer locale="en-US" />);
    expect(html).toContain('src="/brand/mobii.png"');
    expect(html).toContain('Mobii');
    expect(html).toContain('Bidding Procurement');
    expect(html).not.toContain('Built with');
    expect(html).not.toContain('Endora Commerce');
    expect(html).not.toContain('commerce.endora.software');
  });

  it('localises the accent title for zh-CN', () => {
    const html = renderToString(<Footer locale="zh-CN" />);
    expect(html).toContain('竞价批采平台');
    expect(html).toContain('src="/brand/mobii.png"');
  });

  it('sits after copyright / hook slots', () => {
    const html = renderToString(
      <Footer
        locale="en-US"
        bottom={<p>hook-bottom-slot</p>}
        copyright={<span>hook-copyright-slot</span>}
      />,
    );
    const brand = html.indexOf('data-testid="footer-platform-brand"');
    expect(brand).toBeGreaterThan(-1);
    for (const earlier of ['Mobii Green Energy', 'hook-bottom-slot', 'hook-copyright-slot']) {
      expect(html).toContain(earlier);
      expect(html.indexOf(earlier)).toBeLessThan(brand);
    }
  });
});

describe('Footer — batch 63/64 shop / account / support / copyright', () => {
  it('renders Admin level-1 categories and skips hardcoded demo slugs', () => {
    const html = renderToString(
      <Footer
        locale="en-US"
        shopCategories={[
          { slug: 'gpu', name: 'GPU' },
          { slug: 'memory', name: 'Memory' },
        ]}
      />,
    );
    expect(html).toContain('href="/c/gpu"');
    expect(html).toContain('>GPU<');
    expect(html).toContain('href="/c/memory"');
    expect(html).not.toContain('/c/fasteners');
    expect(html).not.toContain('/c/tools');
    expect(html).toContain('href="/quick-order"');
    expect(html).toContain('GPU, Memory');
  });

  it('matches the demo B2B account set (no invoices / credit limit)', () => {
    const html = renderToString(<Footer locale="en-US" />);
    expect(html).toContain('href="/account"');
    expect(html).toContain('href="/orders"');
    expect(html).toContain('href="/quote-requests"');
    expect(html).toContain('href="/shopping-lists"');
    expect(html).not.toContain('href="/invoices"');
    expect(html).not.toContain('href="/credit-limit"');
  });

  it('keeps Contact live and greys out other Support items', () => {
    const html = renderToString(<Footer locale="en-US" />);
    expect(html).toContain('href="/kontakt"');
    expect(html).toContain('Contact');
    expect(html).toContain('Complaints and returns');
    expect(html).toContain('Delivery and payments');
    expect(html).toContain('Certificates and compliance');
    expect(html).toContain('Help center');
    expect(html).toContain('aria-disabled="true"');
    expect(html).not.toContain('href="/reklamacje"');
    expect(html).not.toContain('href="/dostawa"');
    expect(html).not.toContain('href="/certyfikaty"');
    expect(html).not.toContain('href="/pomoc"');
    expect(html).not.toContain('href="/regulamin"');
    expect(html).not.toContain('href="/polityka-prywatnosci"');
    expect(html).not.toContain('href="/cookies"');
  });

  it('shows Mobii Green Energy copyright with tax ID (locale-aware)', () => {
    const en = renderToString(<Footer locale="en-US" />);
    expect(en).toContain('Mobii Green Energy CO., LTD.');
    expect(en).toContain('Tax ID 28010606');
    expect(en).not.toContain('Industria B2B');
    //expect(en).not.toContain('NIP 7251234567');

    const zh = renderToString(<Footer locale="zh-CN" />);
    expect(zh).toContain('莫比绿电股份有限公司');
    expect(zh).toContain('统一编号 28010606');

    const tw = renderToString(<Footer locale="zh-TW" />);
    expect(tw).toContain('莫比綠電股份有限公司');
    expect(tw).toContain('統一編號 28010606');
  });

  it('posts the newsletter form to /newsletter/subscribe with consent + language', () => {
    const html = renderToString(<Footer locale="zh-CN" />);
    expect(html).toContain('action="/newsletter/subscribe"');
    expect(html).toContain('name="consent"');
    expect(html).toContain('name="language"');
    expect(html).toContain('value="zh-CN"');
    expect(html).toContain('name="returnTo" value="/newsletter/subscribed"');
  });
});
