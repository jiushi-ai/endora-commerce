import type { MessageKey } from '../i18n/messages';

/**
 * Account-area catalogue helpers (85 pick — adapted from upstream
 * `storefront/lib/account/labels.tsx`, issue #85 / `4645fffc1`).
 *
 * Full cherry-pick of the catalogue namespace split (`30d0e3ba7`) conflicted with
 * this deployment's monolith `messages.ts` (zh-CN / zh-TW). This file ports the
 * **enum-code → t()** helper so call sites match the open-source pattern without
 * requiring the namespace split first.
 */

type Translate = (key: MessageKey) => string;

/**
 * Label for an API enum code: `t('${prefix}.${code}')` when that catalogue key
 * exists, otherwise the raw `code` (so a value the API added later never shows
 * up as a missing-key string).
 *
 * Upstream checks `MESSAGES['en-US']`; here the catalogue is not exported, so
 * we detect a miss when `t` returns the key itself (see `tForLocale` fallback).
 */
export function codeLabel(t: Translate, prefix: string, code: string): string {
  const key = `${prefix}.${code}`;
  const translated = t(key as MessageKey);
  return translated === key ? code : translated;
}
