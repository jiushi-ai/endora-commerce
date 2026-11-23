/**
 * Admin display label for an order-status code (batch 60).
 *
 * Mirrors `resolveOrderStatusName` in the orders domain without importing the
 * backend tree into the admin bundle: preferred locale → same-base → defaultName → code.
 * OrderDetail / OrdersList previously hard-coded `name['en']`, so ZH-CN never applied.
 */
export function orderStatusLabel(
  def: { code: string; name: Record<string, string>; defaultName?: string | null } | undefined,
  language: string,
  fallbackCode: string,
): string {
  if (!def) return fallbackCode;
  const preferred = language.trim();
  if (preferred) {
    const exact = def.name[preferred];
    if (exact) return exact;
    const lower = preferred.toLowerCase();
    for (const [key, value] of Object.entries(def.name)) {
      if (key.toLowerCase() === lower) return value;
    }
    const base = preferred.split('-')[0]?.toLowerCase() ?? lower;
    for (const [key, value] of Object.entries(def.name)) {
      if ((key.split('-')[0]?.toLowerCase() ?? '') === base) return value;
    }
  }
  if (def.defaultName) return def.defaultName;
  return def.name['en'] ?? Object.values(def.name)[0] ?? fallbackCode;
}
