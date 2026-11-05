/**
 * Storefront language-switcher presentation aligned with Admin
 * (`LanguagePicker`: flag + code + Chinese name).
 *
 * Content language codes stay BCP-47 (`en-US`, `zh-CN`, `zh-TW`).
 */

export interface StorefrontLanguageOption {
  /** Cookie / Accept-Language / i18n config code. */
  code: string;
  /** Short code shown in the pill (EN / ZH-CN / ZH-TW). */
  displayCode: string;
  /** Chinese name matching Admin zh-CN UI labels. */
  label: string;
  /** Unicode regional-indicator flag emoji. */
  flag: string;
}

const OPTIONS: Record<string, StorefrontLanguageOption> = {
  en: { code: 'en', displayCode: 'EN', label: '英语', flag: '🇬🇧' },
  'en-US': { code: 'en-US', displayCode: 'EN', label: '英语', flag: '🇬🇧' },
  'zh-CN': { code: 'zh-CN', displayCode: 'ZH-CN', label: '简体中文', flag: '🇨🇳' },
  'zh-TW': { code: 'zh-TW', displayCode: 'ZH-TW', label: '繁体中文', flag: '🇹🇼' },
  pl: { code: 'pl', displayCode: 'PL', label: '波兰语', flag: '🇵🇱' },
  'pl-PL': { code: 'pl-PL', displayCode: 'PL', label: '波兰语', flag: '🇵🇱' },
};

export function storefrontLanguageOption(
  code: string,
  fallbackLabel = code,
): StorefrontLanguageOption {
  return (
    OPTIONS[code] ??
    OPTIONS[code.split('-')[0] ?? ''] ?? {
      code,
      displayCode: code.toUpperCase(),
      label: fallbackLabel,
      flag: '',
    }
  );
}

/** @deprecated Prefer {@link storefrontLanguageOption}. */
export function storefrontLanguageLabel(code: string, fallbackLabel: string): string {
  return storefrontLanguageOption(code, fallbackLabel).label;
}
