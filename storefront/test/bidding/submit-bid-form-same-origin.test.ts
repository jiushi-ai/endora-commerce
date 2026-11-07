import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Production splits storefront (`b2b.*`) and API (`api.*`). Browser fetch to
 * the API origin never carries `b2b_session` (storefront-scoped cookie). The
 * sealed-bid form must stay same-origin and rely on `/api/bidding/…` BFF routes.
 */
describe('SubmitBidForm same-origin bidding BFF', () => {
  const formSrc = readFileSync(
    resolve(import.meta.dirname, '../../components/bidding/SubmitBidForm.tsx'),
    'utf8',
  );

  it('does not call NEXT_PUBLIC_API_BASE_URL / publicApiBaseUrl from the browser', () => {
    expect(formSrc).not.toMatch(/publicApiBaseUrl/);
    expect(formSrc).not.toMatch(/NEXT_PUBLIC_API_BASE_URL/);
  });

  it('posts uploads and receipts under /api/bidding/campaigns/…', () => {
    expect(formSrc).toMatch(/\/api\/bidding\/campaigns\/\$\{encodeURIComponent\(campaignId\)\}/);
    expect(formSrc).toContain('/intent-attachments');
    expect(formSrc).toContain('/intent-template');
    expect(formSrc).toContain('/receipts');
    expect(formSrc).toContain("credentials: 'same-origin'");
  });
});
