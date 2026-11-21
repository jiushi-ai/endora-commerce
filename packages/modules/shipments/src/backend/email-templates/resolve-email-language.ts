/**
 * Batch 58 — resolve the language used for shipment transactional e-mails.
 *
 * Same ladder as invoice PDF/e-mail (`resolveInvoiceDocumentLanguage`):
 * preferredLanguage (when offered by the channel) → channel defaultLanguage →
 * `en-US`. Copied here so `shipments` never imports `invoices` internals.
 */
export function resolveShipmentEmailLanguage(input: {
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
