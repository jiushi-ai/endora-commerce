import type { PuckDataTree } from '../schema/envelope.js';
import {
  DEFAULT_SYSTEM_EMAIL_LANGUAGES,
  type DefaultSystemEmailLocale,
} from './default-footer.js';

export const DEFAULT_HEADER_BLOCK_CODE = 'default_email_header';

const LOGO_ALT_TEXT: Record<DefaultSystemEmailLocale, string> = {
  'en-US': 'Logo',
  'zh-CN': '标志',
  'zh-TW': '標誌',
  'pl-PL': 'Logo',
};

function logoAltText(locale: string): string {
  if (Object.hasOwn(LOGO_ALT_TEXT, locale)) {
    return LOGO_ALT_TEXT[locale as DefaultSystemEmailLocale];
  }
  return LOGO_ALT_TEXT['en-US'];
}

/** Shared TE + newsletter system header — logo from branding, simple stack. */
export function defaultHeaderTree(locale: string = 'en-US'): PuckDataTree {
  return {
    root: { props: {} },
    content: [
      {
        type: 'transactional_emails.EmailSpacer',
        props: { id: 'default-header-spacer-top', height: 24 },
      },
      {
        type: 'transactional_emails.EmailLogo',
        props: {
          id: 'default-header-logo',
          src: '{{var branding.logoUrl}}',
          alt: logoAltText(locale),
          href: '',
          width: 160,
          align: 'center',
        },
      },
      {
        type: 'transactional_emails.EmailSpacer',
        props: { id: 'default-header-spacer-mid', height: 12 },
      },
      {
        type: 'transactional_emails.EmailDivider',
        props: { id: 'default-header-divider', thickness: 1, color: '#e5e7eb' },
      },
    ],
    zones: {},
  };
}

/** Per-locale header envelope for system block seeds and migrations. */
export function defaultHeaderContentEnvelope(): {
  schema_version: number;
  languages: Record<string, PuckDataTree>;
} {
  const languages: Record<string, PuckDataTree> = {};
  for (const lang of DEFAULT_SYSTEM_EMAIL_LANGUAGES) {
    languages[lang] = defaultHeaderTree(lang);
  }
  return { schema_version: 1, languages };
}