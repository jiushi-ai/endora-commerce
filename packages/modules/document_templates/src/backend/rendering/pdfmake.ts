import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import type { TDocumentDefinitions, TFontDictionary } from 'pdfmake/interfaces.js';

/**
 * The one seam this module has onto pdfmake's server-side singleton.
 *
 * Fonts: Roboto (Latin + Polish) plus optional Noto Sans CJK SC / TC so Chinese
 * (简体 / 繁體) on invoices does not render as tofu. A deny-all URL policy keeps
 * images as inlined `data:` URIs.
 *
 * Batch 46: document-renderer used to hard-code `font: 'Roboto'`, which overrode
 * a registered Noto family. `pdfBytes` now forces the resolved default font when
 * any CJK face is installed. SC vs TC is chosen from the document language.
 *
 * Noto Sans CJK is SIL OFL 1.1; see `fonts/README.md`.
 */

interface PdfMakeOutput {
  getBuffer(): Promise<Buffer>;
}
interface PdfMakeSingleton {
  setFonts(fonts: TFontDictionary): void;
  setUrlAccessPolicy(policy: ((url: string) => boolean) | undefined): void;
  createPdf(definition: TDocumentDefinitions): PdfMakeOutput;
}

const requireFromHere = createRequire(import.meta.url);
const pdfMake = requireFromHere('pdfmake') as PdfMakeSingleton;

export const FONT_ROBOTO = 'Roboto';
export const FONT_CJK_SC = 'NotoSansCJKSC';
export const FONT_CJK_TC = 'NotoSansCJKTC';

let configured = false;
let scPath: string | null = null;
let tcPath: string | null = null;

function firstExisting(paths: readonly string[]): string | null {
  for (const candidate of paths) {
    try {
      if (candidate && fs.existsSync(candidate)) return candidate;
    } catch {
      // ignore
    }
  }
  return null;
}

function moduleFontsDir(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, '../../../fonts');
}

/** Absolute path to Simplified Chinese Regular, or `null`. */
export function resolveCjkScFontPath(): string | null {
  const moduleFonts = moduleFontsDir();
  return firstExisting([
    process.env['DOCUMENT_TEMPLATES_CJK_FONT_SC'] ?? '',
    process.env['DOCUMENT_TEMPLATES_CJK_FONT'] ?? '',
    path.join(moduleFonts, 'NotoSansCJKsc-Regular.otf'),
    path.join(moduleFonts, 'NotoSansSC-Regular.otf'),
    '/usr/share/fonts/truetype/noto/NotoSansCJKsc-Regular.otf',
    '/usr/share/fonts/opentype/noto/NotoSansCJKsc-Regular.otf',
  ]);
}

/** Absolute path to Traditional Chinese Regular, or `null`. */
export function resolveCjkTcFontPath(): string | null {
  const moduleFonts = moduleFontsDir();
  return firstExisting([
    process.env['DOCUMENT_TEMPLATES_CJK_FONT_TC'] ?? '',
    path.join(moduleFonts, 'NotoSansCJKtc-Regular.otf'),
    path.join(moduleFonts, 'NotoSansTC-Regular.otf'),
    '/usr/share/fonts/truetype/noto/NotoSansCJKtc-Regular.otf',
    '/usr/share/fonts/opentype/noto/NotoSansCJKtc-Regular.otf',
  ]);
}

/** @deprecated Prefer {@link resolveCjkScFontPath}. */
export function resolveCjkFontPath(): string | null {
  return resolveCjkScFontPath() ?? resolveCjkTcFontPath();
}

/**
 * pdfmake default font family for a document language.
 * zh-TW / Hant / zh-HK → TC (fallback SC); other zh → SC (fallback TC);
 * en/pl still prefer SC/TC when installed so Chinese *values* do not tofu.
 */
export function resolvePdfDefaultFont(
  documentLanguage?: string | null,
  available: { sc: boolean; tc: boolean } = {
    sc: Boolean(scPath ?? resolveCjkScFontPath()),
    tc: Boolean(tcPath ?? resolveCjkTcFontPath()),
  },
): string {
  const lang = (documentLanguage ?? '').toLowerCase();
  const wantTc =
    lang.startsWith('zh-tw') || lang.startsWith('zh-hk') || lang.includes('hant');
  if (wantTc) {
    if (available.tc) return FONT_CJK_TC;
    if (available.sc) return FONT_CJK_SC;
    return FONT_ROBOTO;
  }
  if (lang.startsWith('zh')) {
    if (available.sc) return FONT_CJK_SC;
    if (available.tc) return FONT_CJK_TC;
    return FONT_ROBOTO;
  }
  if (available.sc) return FONT_CJK_SC;
  if (available.tc) return FONT_CJK_TC;
  return FONT_ROBOTO;
}

function configure(): void {
  if (configured) return;
  const fontsDir = requireFromHere
    .resolve('pdfmake/package.json')
    .replace(/package\.json$/, `fonts${path.sep}Roboto${path.sep}`);
  const fonts: TFontDictionary = {
    Roboto: {
      normal: `${fontsDir}Roboto-Regular.ttf`,
      bold: `${fontsDir}Roboto-Medium.ttf`,
      italics: `${fontsDir}Roboto-Italic.ttf`,
      bolditalics: `${fontsDir}Roboto-MediumItalic.ttf`,
    },
  };
  scPath = resolveCjkScFontPath();
  tcPath = resolveCjkTcFontPath();
  if (scPath) {
    fonts[FONT_CJK_SC] = {
      normal: scPath,
      bold: scPath,
      italics: scPath,
      bolditalics: scPath,
    };
  }
  if (tcPath) {
    fonts[FONT_CJK_TC] = {
      normal: tcPath,
      bold: tcPath,
      italics: tcPath,
      bolditalics: tcPath,
    };
  }
  if (!scPath && !tcPath) {
    console.warn(
      '[document_templates] Noto Sans CJK SC/TC not found; Chinese glyphs on PDFs will render as tofu. See fonts/README.md.',
    );
  }
  pdfMake.setFonts(fonts);
  pdfMake.setUrlAccessPolicy(() => false);
  configured = true;
}

/** The PDF bytes of a document definition. */
export async function pdfBytes(
  definition: TDocumentDefinitions,
  options?: { documentLanguage?: string | null },
): Promise<Uint8Array> {
  configure();
  const font = resolvePdfDefaultFont(options?.documentLanguage ?? null);
  const withDefaultFont: TDocumentDefinitions = {
    ...definition,
    defaultStyle: {
      ...(definition.defaultStyle ?? {}),
      // Always win over a hard-coded Roboto from document-renderer (batch 46).
      font,
    },
  };
  const buffer = await pdfMake.createPdf(withDefaultFont).getBuffer();
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}
