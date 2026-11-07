import { proxyCustomerBackend } from '../../../../../../lib/bidding/proxy-customer-backend';

export const dynamic = 'force-dynamic';

/** Same-origin proxy: POST sealed bid receipt for the logged-in buyer. */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  return proxyCustomerBackend(
    request,
    `/api/v1/bidding/campaigns/${encodeURIComponent(id)}/receipts`,
  );
}
