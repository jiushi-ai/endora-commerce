import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Issue #1178 / batch 52 — `.b2b-account__link` in account tables (upstream
 * PR #1203). Local storefront has no `ModalDialog` yet, so this suite covers
 * the CSS rules only — not the dialog trigger composition test upstream keeps.
 */

const css = readFileSync(resolve(import.meta.dirname, '../../app/globals.css'), 'utf8');

function rule(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const body = new RegExp(`(?:^|[\\s}])${escaped}\\s*\\{([^}]*)\\}`).exec(css)?.[1];
  if (body === undefined) throw new Error(`no rule for ${selector}`);
  return body;
}

describe('.b2b-account__link (issue #1178)', () => {
  it('is underlined in the accent colour, by the semantic tokens only', () => {
    const link = rule('.b2b-account__link');
    expect(link).toMatch(/\bunderline\b/);
    expect(link).toMatch(/\btext-accent\b/);
    expect(link).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it('keeps contrast in dark mode through the light brand tint', () => {
    expect(rule('.b2b-account__link')).toMatch(/dark:text-\[color:var\(--brand-200\)\]/);
  });

  it('shows hover without a colour change and focus with the storefront ring', () => {
    expect(rule('.b2b-account__link:hover')).toMatch(/decoration-2/);
    expect(rule('.b2b-account__link:focus-visible')).toMatch(
      /outline-\[color:var\(--brand-600\)\]/,
    );
  });

  it('meets the 44px floor inside an account table cell without growing the row', () => {
    const inCell = rule('.b2b-account__table .b2b-account__link');
    expect(inCell).toMatch(/\bmin-h-11\b/);
    expect(inCell).toMatch(/\bmin-w-11\b/);
    expect(inCell).toMatch(/-my-\[10px\]/);
  });
});
