import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Bundle } from '@endora-commerce/admin-kit/i18n';

/**
 * The `core` bundle as it ships — `_i18n`'s locale JSON, read off disk,
 * under the synthetic `core` scope the admin serves it as.
 */
export function shippedCoreBundle(language: 'en' | 'pl'): Bundle {
  const raw = readFileSync(
    resolve(process.cwd(), '../packages/modules/_i18n/i18n', `${language}.json`),
    'utf8',
  );
  return { core: JSON.parse(raw) as Record<string, string> };
}