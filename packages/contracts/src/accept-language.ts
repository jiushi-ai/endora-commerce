/**
 * The first tag of an `Accept-Language` header, without its quality parameter,
 * or `undefined` when the header is absent or empty.
 *
 * Feature 167 US6 emitters (mfa OAuth return language, org invitation links)
 * read the browser's preferred tag through this. The full q-weighted parse lives
 * in the platform kernel (`parseAcceptLanguage`); this is the one-tag seam a
 * module may call without taking the product-scopes package.
 */
export function firstLanguageTag(header: string | readonly string[] | undefined): string | undefined {
  const value = Array.isArray(header) ? header[0] : header;
  if (typeof value !== 'string') return undefined;
  const first = value.split(',')[0]?.split(';')[0]?.trim();
  return first ? first : undefined;
}
