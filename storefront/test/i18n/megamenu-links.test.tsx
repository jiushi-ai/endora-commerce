import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import type { ResolvedMegamenu } from '@endora-commerce/contracts';
import { NavigationBar } from '../../components/Megamenu/NavigationBar';
import { LocalePathProvider } from '../../lib/i18n/localized-link';

/**
 * Feature 167 (FR-020, SC-003) — operator-authored megamenu links are localized at
 * render. On this branch the storefront uses NavigationBar (168) instead of
 * CategoriesMega; tabs still render through LocalizedAnchor.
 */
const item = (id: string, label: string, url: string) =>
  ({
    id,
    label,
    url,
    children: [],
    kind: 'link',
    presentation: 'link',
    alignment: 'start',
  }) as unknown as ResolvedMegamenu['items'][number];

const megamenu = {
  megamenuId: '00000000-0000-4000-8000-000000000001',
  name: 'Main',
  language: 'en-US',
  items: [item('a', 'Tools', '/c/tools'), item('b', 'Fasteners', '/c/fasteners')],
} as ResolvedMegamenu;

const labels = {
  navigation: 'Navigation',
  more: 'More',
  allIn: 'All in {label}',
  expand: 'Expand {label}',
};

describe('megamenu department links', () => {
  it('carry the current language prefix', () => {
    const html = renderToString(
      <LocalePathProvider
        value={{
          languages: [
            { languageCode: 'pl-PL', prefix: 'pl', prefixed: true, isDefault: true },
            { languageCode: 'en-US', prefix: 'en', prefixed: true, isDefault: false },
          ],
          aliases: [],
          current: 'en-US',
        }}
      >
        <NavigationBar megamenu={megamenu} labels={labels} />
      </LocalePathProvider>,
    );
    expect(html).toContain('href="/en/c/tools"');
    expect(html).toContain('href="/en/c/fasteners"');
    expect(html).not.toMatch(/href="\/c\//);
  });
});
