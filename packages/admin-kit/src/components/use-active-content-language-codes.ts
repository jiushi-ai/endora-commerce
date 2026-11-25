import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client.js';

/** Mobii default when `GET /api/v1/i18n/config` is unavailable. */
export const MOBII_CONTENT_LANGUAGE_FALLBACK = ['en-US', 'zh-CN', 'zh-TW'] as const;

/**
 * Content locales aligned with `admin-shell` `LanguagePicker` (`en`, `zh-CN`, `zh-TW`)
 * (`en` → `en-US`, `zh-CN`, `zh-TW`). Payment/delivery name fields mirror this set — not `pl-PL`.
 */
export const ADMIN_UI_CONTENT_LOCALES = ['en-US', 'zh-CN', 'zh-TW'] as const;

const ADMIN_UI_LOCALE_SET = new Set<string>(ADMIN_UI_CONTENT_LOCALES);

/**
 * Locales offered in admin forms: intersection of platform-active languages with
 * {@link ADMIN_UI_CONTENT_LOCALES}. Stored-only locales (e.g. legacy `pl-PL`) are omitted
 * from the UI; use {@link buildLocalizedNamePayload} to carry them on save.
 */
export function offeredAdminContentLanguageCodes(active: readonly string[]): string[] {
  const hits = ADMIN_UI_CONTENT_LOCALES.filter((locale) => active.includes(locale));
  return hits.length > 0 ? [...hits] : [...ADMIN_UI_CONTENT_LOCALES];
}

/**
 * @deprecated Prefer {@link offeredAdminContentLanguageCodes} for display; stored keys are
 * preserved on submit via {@link buildLocalizedNamePayload}, not by widening displayed locales.
 */
export function mergeContentLanguageCodes(
  active: readonly string[],
  storedName?: Record<string, string> | null,
): string[] {
  void storedName;
  return offeredAdminContentLanguageCodes(active);
}

async function fetchActiveContentLanguageCodes(): Promise<string[]> {
  const res = await apiClient.get<{ data: { languages: { code: string }[] } }>(
    '/api/v1/i18n/config',
  );
  const codes = res.data.languages.map((row) => row.code);
  return codes.length > 0 ? codes : [...MOBII_CONTENT_LANGUAGE_FALLBACK];
}

/**
 * Active content-language BCP-47 codes for admin forms (payment/delivery names, etc.).
 * Falls back to {@link MOBII_CONTENT_LANGUAGE_FALLBACK} when the config request fails.
 */
export function useActiveContentLanguageCodes(
  storedName?: Record<string, string> | null,
): string[] {
  void storedName;
  const [codes, setCodes] = useState<string[]>(() =>
    offeredAdminContentLanguageCodes(MOBII_CONTENT_LANGUAGE_FALLBACK),
  );

  useEffect(() => {
    let alive = true;
    void fetchActiveContentLanguageCodes()
      .then((active) => {
        if (!alive) return;
        setCodes(offeredAdminContentLanguageCodes(active));
      })
      .catch(() => {
        if (!alive) return;
        setCodes(offeredAdminContentLanguageCodes(MOBII_CONTENT_LANGUAGE_FALLBACK));
      });
    return (): void => {
      alive = false;
    };
  }, []);

  return codes;
}

/** Locales on a stored record that are outside the Admin UI picker (kept on upsert, not shown). */
function preservedNonAdminLocales(storedName?: Record<string, string> | null): Record<string, string> {
  if (!storedName) return {};
  const preserved: Record<string, string> = {};
  for (const [locale, value] of Object.entries(storedName)) {
    if (ADMIN_UI_LOCALE_SET.has(locale)) continue;
    const trimmed = value.trim();
    if (trimmed) preserved[locale] = trimmed;
  }
  return preserved;
}

/** Trimmed name map for API submit; `null` when every locale is empty. */
export function buildLocalizedNamePayload(
  names: Record<string, string>,
  storedName?: Record<string, string> | null,
): Record<string, string> | null {
  const name: Record<string, string> = { ...preservedNonAdminLocales(storedName) };
  for (const [locale, value] of Object.entries(names)) {
    const trimmed = value.trim();
    if (trimmed) name[locale] = trimmed;
  }
  return Object.keys(name).length > 0 ? name : null;
}