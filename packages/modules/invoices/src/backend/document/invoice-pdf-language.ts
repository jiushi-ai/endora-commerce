import type { AmountToWordsLocale } from '../services/amount-to-words.js';

/**
 * Batch 44 — resolve the language used for invoice PDF fixed labels.
 *
 * Order: preferredLanguage (when offered by the channel) → channel
 * defaultLanguage → `en-US`.
 */
export function resolveInvoiceDocumentLanguage(input: {
  preferredLanguage?: string | null;
  channelLanguages?: readonly string[] | null;
  channelDefaultLanguage?: string | null;
}): string {
  const preferred = input.preferredLanguage?.trim() || null;
  const languages = input.channelLanguages ?? [];
  const channelDefault = input.channelDefaultLanguage?.trim() || null;

  if (preferred) {
    if (languages.length === 0) return preferred;
    const exact = languages.find((language) => language.toLowerCase() === preferred.toLowerCase());
    if (exact) return exact;
    const base = preferred.split('-')[0]?.toLowerCase() ?? preferred.toLowerCase();
    const sameBase = languages.find(
      (language) => (language.split('-')[0]?.toLowerCase() ?? '') === base,
    );
    if (sameBase) return sameBase;
  }
  return channelDefault || 'en-US';
}

/** Amount-in-words locale: Polish words only for `pl*`; otherwise English. */
export function amountLocaleOf(documentLanguage: string): AmountToWordsLocale {
  return documentLanguage.toLowerCase().startsWith('pl') ? 'pl' : 'en';
}

/** `toLocaleString` tag for monetary figures on the PDF. */
export function numberLocaleOf(documentLanguage: string): string {
  const lower = documentLanguage.toLowerCase();
  if (lower.startsWith('pl')) return 'pl-PL';
  if (lower.startsWith('zh')) return documentLanguage;
  return 'en-US';
}
