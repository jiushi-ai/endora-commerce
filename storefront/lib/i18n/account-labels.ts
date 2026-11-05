import { tForLocale, type MessageKey } from './messages';

/**
 * Localized customer-role labels for account surfaces.
 * Unknown codes fall back to the raw API value.
 */
export function accountRoleLabel(role: string, locale: string): string {
  const key = `account.role.${role}` as MessageKey;
  const t = tForLocale(locale);
  const translated = t(key);
  return translated === key ? role : translated;
}

/** Address kind: delivery / billing. */
export function accountAddressKindLabel(kind: string, locale: string): string {
  const key = `account.addresses.kind.${kind}` as MessageKey;
  const t = tForLocale(locale);
  const translated = t(key);
  return translated === key ? kind : translated;
}
