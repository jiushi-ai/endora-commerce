import type { QuickOrderImportRequest } from '@endora-commerce/contracts';
import { decodeCsvText } from './decode-csv-text.js';
import { parseCsvRows, type ParseOutcome } from './import-rows.js';
import { parseXlsxRows } from './excel-importer.js';

/**
 * Turn an import request body (pasted CSV or an uploaded CSV / .xlsx file)
 * into normalized rows. Shared by the storefront and admin import routes so
 * both branch on format identically (feature 039).
 *
 * CSV files are decoded as strict UTF-8 first, then GB18030 (Chinese Excel
 * "CSV" exports), so rejected-row previews keep CJK characters readable.
 */
export async function parseImportRequest(
  body: Pick<QuickOrderImportRequest, 'csv' | 'file'>,
): Promise<ParseOutcome> {
  if (body.file) {
    const buffer = Buffer.from(body.file.contentBase64, 'base64');
    return body.file.filename.toLowerCase().endsWith('.xlsx')
      ? parseXlsxRows(buffer)
      : parseCsvRows(decodeCsvText(buffer));
  }
  return parseCsvRows(body.csv ?? '');
}
