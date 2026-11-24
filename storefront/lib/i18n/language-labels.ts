/**
 * Storefront language-switcher presentation aligned with Admin
 * (`LanguagePicker`: flag + code + localized name).
 *
 * Content language codes stay BCP-47 (`en-US`, `zh-CN`, `zh-TW`).
 * Batch 64 — option labels follow the current UI locale via `messages.ts`
 * (`lang.name.*`), not a hard-coded Chinese-only map.
 */

import { tForLocale, type MessageKey } from './messages';

export interface StorefrontLanguageOption {
  /** Cookie / Accept-Language / i18n config code. */
  code: string;
  /** Short code shown in the pill (EN / ZH-CN / ZH-TW). */
  displayCode: string;
  /** Localized name for the current UI locale. */
  label: string;
  /** Unicode regional-indicator flag emoji. */
  flag: string;
}

const META: Record<string, Omit<StorefrontLanguageOption, 'label'>> = {
  en: { code: 'en', displayCode: 'EN', flag: '🇬🇧' },
  'en-US': { code: 'en-US', displayCode: 'EN', flag: '🇬🇧' },
  'zh-CN': { code: 'zh-CN', displayCode: 'ZH-CN', flag: '🇨🇳' },
  'zh-TW': { code: 'zh-TW', displayCode: 'ZH-TW', flag: '🇹🇼' },
  pl: { code: 'pl', displayCode: 'PL', flag: '🇵🇱' },
  'pl-PL': { code: 'pl-PL', displayCode: 'PL', flag: '🇵🇱' },
};

const LABEL_KEYS: Record<string, MessageKey> = {
  en: 'lang.name.en',
  'en-US': 'lang.name.en-US',
  'zh-CN': 'lang.name.zh-CN',
  'zh-TW': 'lang.name.zh-TW',
  pl: 'lang.name.pl',
  'pl-PL': 'lang.name.pl-PL',
};

function resolveMeta(code: string): Omit<StorefrontLanguageOption, 'label'> {
  return (
    META[code] ??
    META[code.split('-')[0] ?? ''] ?? {
      code,
      displayCode: code.toUpperCase(),
      flag: '',
    }
  );
}

/**
 * @param code — BCP-47 content language
 * @param options.uiLocale — UI locale used to look up `lang.name.*` (defaults zh-CN for legacy callers)
 * @param options.fallbackLabel — used when the code is unknown to the catalogue
 */
export function storefrontLanguageOption(
  code: string,
  options?: { uiLocale?: string; fallbackLabel?: string },
): StorefrontLanguageOption {
  const meta = resolveMeta(code);
  const uiLocale = options?.uiLocale ?? 'zh-CN';
  const t = tForLocale(uiLocale);
  const key = LABEL_KEYS[code] ?? LABEL_KEYS[code.split('-')[0] ?? ''];
  const label = key ? t(key) : (options?.fallbackLabel ?? code);
  return { ...meta, label };
}

/** @deprecated Prefer {@link storefrontLanguageOption}. */
export function storefrontLanguageLabel(
  code: string,
  fallbackLabel: string,
  uiLocale?: string,
): string {
  return storefrontLanguageOption(code, { uiLocale, fallbackLabel }).label;
}
