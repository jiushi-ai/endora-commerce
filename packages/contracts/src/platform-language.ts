// The language the platform answers a request in (feature 083, D-136).
//
// Named for the platform, not for an audience. The constant this replaces was
// `ADMIN_LANGUAGE_FALLBACK`, and the name is what made issue #234 invisible:
// a fallback called "admin" reads correctly in a resolver that only ever
// answered admins, so nobody asked why a buyer was reaching it.

import { z } from 'zod';

/**
 * The languages the platform ships translation bundles for.
 *
 * Distinct from `Language` in `i18n.ts`, which is the operator-configured
 * **content** language pool — BCP-47, database rows, extended at runtime by an
 * operator. This enum is extended only by shipping a bundle and changing this
 * line. `normalise` in `backend/src/kernel/i18n/request-language.ts` is the
 * bridge between the two, and a bridge needs both ends named.
 */
/**
 * UI translation-bundle languages.
 * `pl` remains shippable (existing bundles kept); Admin chrome offers
 * `en` / `zh-CN` / `zh-TW` in the language picker.
 */
export const SupportedLanguageSchema = z.enum(['en', 'pl', 'zh-CN', 'zh-TW']);
export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

/** Convenience: every supported value as a runtime array. */
export const SUPPORTED_LANGUAGES = SupportedLanguageSchema.options;

/** The language the platform answers in when nothing else resolves. */
export const LANGUAGE_FALLBACK: SupportedLanguage = 'en';

/**
 * The shipped language a BCP-47 tag (`pl-PL`, `zh-CN`, a sales channel's
 * `defaultLanguage`) is written in — an exact / prefix match against
 * {@link SUPPORTED_LANGUAGES}, else a primary-subtag match, else
 * {@link LANGUAGE_FALLBACK}.
 *
 * This fork ships `zh-CN` / `zh-TW` as full tags (not only `en` / `pl`), so
 * matching prefers the full tag before falling back to the primary subtag.
 * A bare `zh` maps to `zh-CN`.
 */
export function supportedLanguageOf(tag: string | null | undefined): SupportedLanguage {
  const raw = (tag ?? '').trim();
  if (!raw) return LANGUAGE_FALLBACK;
  const normalized = raw.replace(/_/g, '-');
  const lower = normalized.toLowerCase();
  for (const lang of SUPPORTED_LANGUAGES) {
    const langLower = lang.toLowerCase();
    if (lower === langLower || lower.startsWith(`${langLower}-`)) return lang;
  }
  const primary = lower.split('-', 1)[0] ?? '';
  if ((SUPPORTED_LANGUAGES as readonly string[]).includes(primary)) {
    return primary as SupportedLanguage;
  }
  if (primary === 'zh') return 'zh-CN';
  return LANGUAGE_FALLBACK;
}
