import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Footer } from '../../components/Footer';

/**
 * Batch 21 — footer platform strip matches Admin: Mobii logo + locale title
 * (no Endora "Built with" credit).
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

  it('sits after copyright / legal links', () => {
    const html = renderToString(
      <Footer
        locale="en-US"
        bottom={<p>hook-bottom-slot</p>}
        copyright={<span>hook-copyright-slot</span>}
      />,
    );
    const brand = html.indexOf('data-testid="footer-platform-brand"');
    expect(brand).toBeGreaterThan(-1);
    for (const earlier of [
      'Industria B2B Sp. z o.o.',
      'hook-bottom-slot',
      'hook-copyright-slot',
      'Privacy policy',
      'Cookies',
    ]) {
      expect(html).toContain(earlier);
      expect(html.indexOf(earlier)).toBeLessThan(brand);
    }
  });
});
