import { describe, expect, it } from 'vitest';
import { decodeCsvText } from './decode-csv-text.js';

describe('decodeCsvText', () => {
  it('decodes plain UTF-8 CSV', () => {
    const text = 'sku,quantity\n金士顿-TEST,10\n';
    expect(decodeCsvText(Buffer.from(text, 'utf8'))).toBe(text);
  });

  it('strips a UTF-8 BOM', () => {
    const body = 'sku,quantity\nA,1\n';
    const withBom = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(body, 'utf8')]);
    expect(decodeCsvText(withBom)).toBe(body);
  });

  it('falls back to GB18030 for Chinese Excel-style bytes', () => {
    // "金士顿 Fury,10" encoded as GB18030 (typical Excel "CSV" on zh-CN Windows).
    const gb = Buffer.from([
      0xbd, 0xf0, 0xca, 0xbf, 0xb6, 0xd9, 0x20, 0x46, 0x75, 0x72, 0x79, 0x2c, 0x31, 0x30,
    ]);
    const decoded = decodeCsvText(gb);
    expect(decoded).toContain('金士顿');
    expect(decoded).toContain('Fury');
    expect(decoded).not.toContain('\uFFFD');
  });

  it('does not leave replacement characters when UTF-8 is forced on GB bytes', () => {
    const gb = Buffer.from([0xbd, 0xf0, 0xca, 0xbf, 0xb6, 0xd9, 0x2c, 0x31]);
    expect(Buffer.from(gb).toString('utf8')).toContain('\uFFFD');
    expect(decodeCsvText(gb)).toBe('金士顿,1');
  });
});
