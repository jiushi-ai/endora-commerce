import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import type { TDocumentDefinitions, TFontDictionary } from 'pdfmake/interfaces.js';

/**
 * The one seam this module has onto pdfmake's server-side singleton.
 *
 * pdfmake's font dictionary and URL policy are process-global, and every
 * renderer in the platform (`comparisons`' fixed layout, this engine) sets them
 * to the same values: Roboto (Latin + Polish) plus, when available, Noto Sans
 * CJK SC so Chinese names on invoices do not render as tofu — and a deny-all
 * URL policy (images are inlined as `data:` URIs before a render).
 *
 * Noto Sans CJK is SIL OFL 1.1; see `fonts/README.md`. The binary is resolved
 * at runtime, not committed (batch 44).
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

let configured = false;
let defaultFontFamily = 'Roboto';

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

/** Absolute path to a CJK-capable Regular face, or `null` when none is installed. */
export function resolveCjkFontPath(): string | null {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const moduleFonts = path.resolve(here, '../../../fonts');
  return firstExisting([
    process.env['DOCUMENT_TEMPLATES_CJK_FONT'] ?? '',
    path.join(moduleFonts, 'NotoSansCJKsc-Regular.otf'),
    path.join(moduleFonts, 'NotoSansSC-Regular.otf'),
    '/usr/share/fonts/truetype/noto/NotoSansCJKsc-Regular.otf',
    '/usr/share/fonts/opentype/noto/NotoSansCJKsc-Regular.otf',
  ]);
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
  const cjk = resolveCjkFontPath();
  if (cjk) {
    // One Regular face for all styles — enough to print Chinese names; Latin
    // glyphs are also in Noto Sans CJK SC, so it can be the document default.
    fonts.NotoSansCJK = {
      normal: cjk,
      bold: cjk,
      italics: cjk,
      bolditalics: cjk,
    };
    defaultFontFamily = 'NotoSansCJK';
  }
  pdfMake.setFonts(fonts);
  pdfMake.setUrlAccessPolicy(() => false);
  configured = true;
}

/** The PDF bytes of a document definition. */
export async function pdfBytes(definition: TDocumentDefinitions): Promise<Uint8Array> {
  configure();
  const withDefaultFont: TDocumentDefinitions = {
    ...definition,
    defaultStyle: {
      ...(definition.defaultStyle ?? {}),
      font: (definition.defaultStyle as { font?: string } | undefined)?.font ?? defaultFontFamily,
    },
  };
  const buffer = await pdfMake.createPdf(withDefaultFont).getBuffer();
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}
