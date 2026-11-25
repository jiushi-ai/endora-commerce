import type { PuckDataTree } from '../schema/envelope.js';

export const DEFAULT_FOOTER_BLOCK_CODE = 'default_email_footer';

/** Locales seeded on system header/footer blocks (feature 047 + batch 66 email i18n). */
export const DEFAULT_SYSTEM_EMAIL_LANGUAGES = ['en-US', 'zh-CN', 'zh-TW', 'pl-PL'] as const;

export type DefaultSystemEmailLocale = (typeof DEFAULT_SYSTEM_EMAIL_LANGUAGES)[number];

const FOOTER_LEGAL_TEXT: Record<DefaultSystemEmailLocale, string> = {
  'en-US':
    'You are receiving this email because of activity related to your account.\n' +
    '<a href="{{var unsubscribeUrl}}">Unsubscribe</a>',
  'zh-CN':
    '您收到此邮件是因为与您的账户相关的活动。\n' +
    '<a href="{{var unsubscribeUrl}}">取消订阅</a>',
  'zh-TW':
    '您收到此郵件是因為與您的帳戶相關的活動。\n' +
    '<a href="{{var unsubscribeUrl}}">取消訂閱</a>',
  'pl-PL':
    'Otrzymujesz tę wiadomość w związku z aktywnością na Twoim koncie.\n' +
    '<a href="{{var unsubscribeUrl}}">Wypisz się</a>',
};

function footerLegalText(locale: string): string {
  if (Object.hasOwn(FOOTER_LEGAL_TEXT, locale)) {
    return FOOTER_LEGAL_TEXT[locale as DefaultSystemEmailLocale];
  }
  return FOOTER_LEGAL_TEXT['en-US'];
}

/**
 * Shared TE + newsletter system footer.
 * Newsletter send injects `unsubscribeUrl`; TE leaves the link empty when unset.
 */
export function defaultFooterTree(locale: string = 'en-US'): PuckDataTree {
  return {
    root: { props: {} },
    content: [
      {
        type: 'transactional_emails.EmailDivider',
        props: { id: 'default-footer-divider', thickness: 1, color: '#e5e7eb' },
      },
      {
        type: 'transactional_emails.EmailSpacer',
        props: { id: 'default-footer-spacer-top', height: 12 },
      },
      {
        type: 'transactional_emails.EmailFooterLegal',
        props: {
          id: 'default-footer-legal',
          text: footerLegalText(locale),
          align: 'center',
        },
      },
      {
        type: 'transactional_emails.EmailSpacer',
        props: { id: 'default-footer-spacer-bottom', height: 24 },
      },
    ],
    zones: {},
  };
}

/** Per-locale footer envelope for system block seeds and migrations. */
export function defaultFooterContentEnvelope(): {
  schema_version: number;
  languages: Record<string, PuckDataTree>;
} {
  const languages: Record<string, PuckDataTree> = {};
  for (const lang of DEFAULT_SYSTEM_EMAIL_LANGUAGES) {
    languages[lang] = defaultFooterTree(lang);
  }
  return { schema_version: 1, languages };
}

/** Build a single-language content envelope from a tree, for the given languages. */
export function envelopeFromTree(
  tree: PuckDataTree,
  languages: readonly string[],
): { schema_version: number; languages: Record<string, PuckDataTree> } {
  const byLang: Record<string, PuckDataTree> = {};
  for (const lang of languages) byLang[lang] = tree;
  return { schema_version: 1, languages: byLang };
}