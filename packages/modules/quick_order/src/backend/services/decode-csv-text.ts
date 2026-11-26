/**
 * Decode uploaded CSV bytes for Quick Order import.
 *
 * Excel on Chinese Windows often saves CSV as GBK/GB18030 without a BOM.
 * Decoding those bytes as UTF-8 yields U+FFFD replacement characters in the
 * rejected-row preview. Prefer strict UTF-8 (BOM stripped); fall back to
 * GB18030 when the bytes are not valid UTF-8.
 */

const UTF8_BOM = '\uFEFF';

/**
 * Decode CSV file bytes to a Unicode string for `parseCsvRows`.
 * / 将 CSV 文件字节解码为供 `parseCsvRows` 使用的 Unicode 字符串。
 */
export function decodeCsvText(bytes: Buffer | Uint8Array): string {
  try {
    return stripBom(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    try {
      return stripBom(new TextDecoder('gb18030').decode(bytes));
    } catch {
      return stripBom(Buffer.from(bytes).toString('utf8'));
    }
  }
}

/** Drop a leading UTF-8 BOM if present. / 去掉开头的 UTF-8 BOM（若有）。 */
function stripBom(text: string): string {
  return text.startsWith(UTF8_BOM) ? text.slice(1) : text;
}
