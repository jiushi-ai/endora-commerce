/**
 * Batch 64 — double opt-in confirmation copy by content language.
 *
 * Ladder (same idea as order/invoice e-mails): preferredLanguage → UI/request
 * language hint → `en-US`. Plain text/HTML — this path does not go through
 * transactional_emails templates.
 */

export type ConfirmationEmailCopy = {
  subject: string;
  text: (url: string) => string;
  html: (url: string) => string;
};

const COPY: Record<string, ConfirmationEmailCopy> = {
  'en-US': {
    subject: 'Confirm your newsletter subscription',
    text: (url) => `Please confirm your subscription by opening this link:\n${url}\n`,
    html: (url) =>
      `<p>Please confirm your subscription:</p><p><a href="${url}">Confirm subscription</a></p>`,
  },
  'zh-CN': {
    subject: '确认您的通讯订阅',
    text: (url) => `请打开以下链接以确认订阅：\n${url}\n`,
    html: (url) => `<p>请确认您的通讯订阅：</p><p><a href="${url}">确认订阅</a></p>`,
  },
  'zh-TW': {
    subject: '確認您的電子報訂閱',
    text: (url) => `請開啟以下連結以確認訂閱：\n${url}\n`,
    html: (url) => `<p>請確認您的電子報訂閱：</p><p><a href="${url}">確認訂閱</a></p>`,
  },
  'pl-PL': {
    subject: 'Potwierdź subskrypcję newslettera',
    text: (url) => `Potwierdź subskrypcję, otwierając ten link:\n${url}\n`,
    html: (url) =>
      `<p>Potwierdź subskrypcję newslettera:</p><p><a href="${url}">Potwierdź subskrypcję</a></p>`,
  },
};

const ALIASES: Record<string, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  'zh-cn': 'zh-CN',
  'zh-tw': 'zh-TW',
  pl: 'pl-PL',
  'pl-pl': 'pl-PL',
};

/** Pick confirmation copy for a BCP-47 tag; unknown tags fall back to en-US. */
export function confirmationEmailCopy(language: string | null | undefined): ConfirmationEmailCopy {
  const raw = language?.trim() || 'en-US';
  if (COPY[raw]) return COPY[raw]!;
  const aliased = ALIASES[raw.toLowerCase()];
  if (aliased && COPY[aliased]) return COPY[aliased]!;
  const base = raw.split('-')[0]?.toLowerCase() ?? '';
  const fromBase = ALIASES[base];
  if (fromBase && COPY[fromBase]) return COPY[fromBase]!;
  return COPY['en-US']!;
}
