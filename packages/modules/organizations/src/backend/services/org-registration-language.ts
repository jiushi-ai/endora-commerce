import { notificationEmailLanguageToSupported } from '@endora-commerce/contracts';
import type { SupportedLanguage } from '@endora-commerce/contracts';
import {
  organizationsProse,
  type OrganizationsProseKey,
  type OrganizationsTranslate,
} from './organizations-prose.js';

/** Organization status labels for new-org notification e-mails and the admin bell. */
export type OrgRegistrationStatus = 'pending_verification' | 'active';

const STATUS_LABEL_KEY: Record<OrgRegistrationStatus, OrganizationsProseKey> = {
  pending_verification: 'notifications.newRegistration.status.pending',
  active: 'notifications.newRegistration.status.active',
};

/**
 * Resolves the status line injected into `new_org_registration` templates and
 * legacy plaintext bodies, using the configured notification e-mail language.
 */
export async function resolveNewOrgRegistrationStatusLabel(input: {
  status: OrgRegistrationStatus;
  notificationEmailLanguage: string;
  translate?: OrganizationsTranslate;
}): Promise<string> {
  const adminLanguage = notificationEmailLanguageToSupported(input.notificationEmailLanguage);
  return organizationsProse(
    input.translate,
    STATUS_LABEL_KEY[input.status],
    adminLanguage,
  );
}

/** Admin in-app notification copy language — same ladder as notification e-mail. */
export function adminLanguageForOrgRegistration(
  notificationEmailLanguage: string,
): SupportedLanguage {
  return notificationEmailLanguageToSupported(notificationEmailLanguage);
}