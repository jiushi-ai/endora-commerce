import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CheckoutHeader } from '../../components/checkout/CheckoutHeader';

/**
 * Feature 036 (US5) — on /checkout* routes the layout swaps the full
 * storefront header for a logo-only minimal header. Batch 38 — brand mark
 * matches the Mobii storefront Header, not the upstream Industria placeholder.
 */
describe('CheckoutHeader (minimal chrome)', () => {
  it('renders a single banner with a Mobii brand link to the home page', () => {
    const html = renderToString(<CheckoutHeader locale="zh-TW" />);
    expect(html).toContain('role="banner"');
    expect(html).toContain('href="/"');
    expect(html).toContain('/brand/mobii.png');
    expect(html).toContain('Mobii B2B');
    expect(html).toContain('競價批採平台');
    expect(html).not.toContain('Industria');
  });

  it('contains no navigation, search, megamenu, or cart-icon affordances', () => {
    const html = renderToString(<CheckoutHeader locale="en-US" />);
    expect(html).not.toMatch(/<nav\b/);
    expect(html.toLowerCase()).not.toContain('search');
    expect(html.toLowerCase()).not.toContain('megamenu');
    expect(html.toLowerCase()).not.toContain('cart');
  });
});
