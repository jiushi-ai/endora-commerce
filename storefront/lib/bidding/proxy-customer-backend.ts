/**
 * Same-origin BFF helper for browser → storefront → backend bidding calls.
 *
 * `b2b_session` is httpOnly and scoped to the storefront origin (see
 * `lib/session.ts`). A browser `fetch` to `NEXT_PUBLIC_API_BASE_URL` therefore
 * cannot carry the buyer identity when the API host differs (production:
 * `b2b.*` vs `api.*`). Localhost hides the bug because cookies ignore port.
 *
 * Route handlers under `/api/bidding/…` use this helper to forward the session
 * cookie to `BACKEND_BASE_URL` — the same pattern as quote-request server
 * actions (`app/(commerce)/quote-request/actions.ts`).
 */

import { cookies, headers } from 'next/headers';
import { backendBaseUrl } from '../env.mjs';
import { channelHeaders, SALES_CHANNEL_REQUEST_HEADER } from '../channel/channel-header';

const SESSION_COOKIE = 'b2b_session';

/**
 * Proxy an authenticated customer request to the backend path (must start with `/`).
 */
export async function proxyCustomerBackend(
  request: Request,
  backendPath: string,
): Promise<Response> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (!session) {
    return Response.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication is required.',
        },
      },
      { status: 401 },
    );
  }

  const inbound = await headers();
  const channel = inbound.get(SALES_CHANNEL_REQUEST_HEADER);
  const outbound = new Headers({
    Cookie: `${SESSION_COOKIE}=${session}`,
    Accept: request.headers.get('Accept') ?? 'application/json',
    ...channelHeaders(channel),
  });

  const method = request.method.toUpperCase();
  let body: BodyInit | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    const contentType = request.headers.get('Content-Type') ?? '';
    if (contentType.includes('multipart/form-data')) {
      // Rebuild FormData so fetch sets a fresh boundary (do not copy Content-Type).
      body = await request.formData();
    } else {
      body = await request.arrayBuffer();
      if (contentType) outbound.set('Content-Type', contentType);
    }
  }

  const base = backendBaseUrl().replace(/\/+$/, '');
  // exactOptionalPropertyTypes: omit `body` when unset (undefined ≠ RequestInit.body).
  const upstream = await fetch(`${base}${backendPath}`, {
    method,
    headers: outbound,
    ...(body !== undefined ? { body } : {}),
    cache: 'no-store',
  });

  const responseHeaders = new Headers();
  const upstreamType = upstream.headers.get('Content-Type');
  if (upstreamType) responseHeaders.set('Content-Type', upstreamType);

  return new Response(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: responseHeaders,
  });
}
