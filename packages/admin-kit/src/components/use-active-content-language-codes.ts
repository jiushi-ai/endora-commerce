import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client.js';

/** Mobii default when `GET /api/v1/i18n/config` is unavailable. */
export const MOBII_CONTENT_LANGUAGE_FALLBACK = ['en-US', 'zh-CN', 'zh-TW'] as const;

/**
 * Union active platform languages with any locales already stored on a record,
 * so editing never drops a translation from the form.
 */
export function mergeContentLanguageCodes(
  active: readonly string[],
  storedName?: Record<string, string> | null,
): string[] {
  const codes = new Set(active);
  if (storedName) {
    for (const key of Object.keys(storedName)) {
      codes.add(key);
    }
  }
  return [...codes];
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
  const [codes, setCodes] = useState<string[]>(() =>
    mergeContentLanguageCodes(MOBII_CONTENT_LANGUAGE_FALLBACK, storedName),
  );

  useEffect(() => {
    let alive = true;
    void fetchActiveContentLanguageCodes()
      .then((active) => {
        if (!alive) return;
        setCodes(mergeContentLanguageCodes(active, storedName));
      })
      .catch(() => {
        if (!alive) return;
        setCodes(mergeContentLanguageCodes(MOBII_CONTENT_LANGUAGE_FALLBACK, storedName));
      });
    return (): void => {
      alive = false;
    };
  }, [storedName]);

  return codes;
}

/** Trimmed name map for API submit; `null` when every locale is empty. */
export function buildLocalizedNamePayload(
  names: Record<string, string>,
): Record<string, string> | null {
  const name: Record<string, string> = {};
  for (const [locale, value] of Object.entries(names)) {
    const trimmed = value.trim();
    if (trimmed) name[locale] = trimmed;
  }
  return Object.keys(name).length > 0 ? name : null;
}