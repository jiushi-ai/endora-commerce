import { apiGetAuthed, apiMutate } from './mutations';

/**
 * Authenticated storefront account flows. Every call requires an active
 * `b2b_session` cookie which is forwarded to the backend.
 */

export interface CurrentCustomer {
  id: string;
  /** Null for standalone (org-less) customers (feature 040). */
  organizationId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  role: 'organization_admin' | 'regular_user';
  emailVerifiedAt: string | null;
  twoFactorEnabled: boolean;
  /** Issue #652 — e-mail / document language; `null` while unknown. */
  preferredLanguage: string | null;
}

export type OrganizationLifecycleStatus =
  | 'pending_verification'
  | 'active'
  | 'blocked'
  | 'rejected';

export interface CurrentOrganization {
  id: string;
  name: string;
  legalName?: string | null;
  taxId: string;
  status: OrganizationLifecycleStatus | string;
  vatStatus: string;
  registeredAddress: { street: string; city: string; postalCode: string; country: string };
  version?: number;
  /**
   * Feature 026 — convenience flag (`status === 'active'`). Surfaced by the
   * backend so the storefront can disable order CTAs without re-implementing
   * the rule.
   */
  canTransact?: boolean;
  /**
   * Feature 026 — localized, customer-safe explanation of the current status.
   * `null` when `canTransact` is `true`. Use as the cart/checkout banner body.
   */
  moderationMessage?: string | null;
}

export interface MeResult {
  customerAccount: CurrentCustomer;
  /** Null for standalone (org-less) customers (feature 040). */
  organization: CurrentOrganization | null;
  /** Non-null when the current session is an Admin impersonating this customer. */
  impersonation: { impersonatorAdminUserId: string } | null;
}

export async function getMe(sessionCookie: string): Promise<MeResult> {
  return apiGetAuthed<MeResult>({ path: '/api/v1/me', sessionCookie });
}

export async function changePassword(
  sessionCookie: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await apiMutate<null>({
    method: 'POST',
    path: '/api/v1/me/password',
    body: { currentPassword, newPassword },
    sessionCookie,
  });
}

/** Issue #652 — save the buyer's e-mail / document language. */
export async function updatePreferredLanguage(
  sessionCookie: string,
  preferredLanguage: string,
  ctx?: import('./client').RequestContext,
): Promise<string | null> {
  const result = await apiMutate<{ preferredLanguage: string }>({
    method: 'PATCH',
    path: '/api/v1/me/customer/preferred-language',
    body: { preferredLanguage },
    sessionCookie,
    ctx,
  });
  return result.data?.preferredLanguage ?? null;
}
