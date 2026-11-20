/**
 * Default content for the `invoice_issued` transactional email (feature 047).
 * Simple layout: header → heading → details → download CTA → footer.
 */

import { simpleEmailBodyTree } from '@endora-commerce/email-components/defaults/simple-email-body';

const DEFAULT_LANGUAGES = ['en-US', 'pl-PL', 'zh-CN', 'zh-TW'];

export const INVOICE_ISSUED_DEFAULT = {
  defaultSubject: {
    'en-US': 'Invoice {{var invoice.number}}',
    'pl-PL': 'Faktura {{var invoice.number}}',
    'zh-CN': '发票 {{var invoice.number}}',
    'zh-TW': '發票 {{var invoice.number}}',
  } as Record<string, string>,
  defaultContent: {
    schema_version: 1,
    languages: {
      'en-US': simpleEmailBodyTree({
        idPrefix: 'invoice',
        heading: 'Your invoice',
        text: [
          'Your invoice has been issued.',
          '',
          'Invoice number: {{var invoice.number}}',
          'Order: {{var order.businessId}}',
          'Total: {{var invoice.total}} {{var invoice.currency}}',
        ].join('\n'),
        ctaLabel: 'Download invoice',
        ctaHref: '{{var invoice.downloadUrl}}',
      }),
      'pl-PL': simpleEmailBodyTree({
        idPrefix: 'invoice',
        heading: 'Twoja faktura',
        text: [
          'Twoja faktura została wystawiona.',
          '',
          'Numer faktury: {{var invoice.number}}',
          'Zamówienie: {{var order.businessId}}',
          'Razem: {{var invoice.total}} {{var invoice.currency}}',
        ].join('\n'),
        ctaLabel: 'Pobierz fakturę',
        ctaHref: '{{var invoice.downloadUrl}}',
      }),
      'zh-CN': simpleEmailBodyTree({
        idPrefix: 'invoice',
        heading: '您的发票',
        text: [
          '您的发票已开具。',
          '',
          '发票号码：{{var invoice.number}}',
          '订单：{{var order.businessId}}',
          '合计：{{var invoice.total}} {{var invoice.currency}}',
        ].join('\n'),
        ctaLabel: '下载发票',
        ctaHref: '{{var invoice.downloadUrl}}',
      }),
      'zh-TW': simpleEmailBodyTree({
        idPrefix: 'invoice',
        heading: '您的發票',
        text: [
          '您的發票已開立。',
          '',
          '發票號碼：{{var invoice.number}}',
          '訂單：{{var order.businessId}}',
          '合計：{{var invoice.total}} {{var invoice.currency}}',
        ].join('\n'),
        ctaLabel: '下載發票',
        ctaHref: '{{var invoice.downloadUrl}}',
      }),
    },
  } as Record<string, unknown>,
  languages: DEFAULT_LANGUAGES,
};
