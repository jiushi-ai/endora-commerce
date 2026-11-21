// Default subject + content for the shipment_created transactional email
// (feature 047). Simple layout via shared header/footer embeds.

import { simpleEmailBodyTree } from '@endora-commerce/email-components/defaults/simple-email-body';

const LANGS = ['en-US', 'pl-PL', 'zh-CN', 'zh-TW'];

export const SHIPMENT_CREATED_DEFAULT = {
  defaultSubject: {
    'en-US': 'Your order {{var order.businessId}} has shipped',
    'pl-PL': 'Twoje zamówienie {{var order.businessId}} zostało wysłane',
    'zh-CN': '您的订单 {{var order.businessId}} 已发货',
    'zh-TW': '您的訂單 {{var order.businessId}} 已出貨',
  } as Record<string, string>,
  defaultContent: {
    schema_version: 1,
    languages: {
      'en-US': simpleEmailBodyTree({
        idPrefix: 'shipment',
        heading: 'Your order has shipped',
        text: 'Good news — a shipment has been created for your order {{var order.businessId}}. Tracking: {{var shipment.tracking}}',
      }),
      'pl-PL': simpleEmailBodyTree({
        idPrefix: 'shipment',
        heading: 'Zamówienie wysłane',
        text: 'Dobra wiadomość — utworzono przesyłkę dla Twojego zamówienia {{var order.businessId}}. Numer śledzenia: {{var shipment.tracking}}',
      }),
      'zh-CN': simpleEmailBodyTree({
        idPrefix: 'shipment',
        heading: '您的订单已发货',
        text: '好消息 — 您的订单 {{var order.businessId}} 已创建发货。运单号：{{var shipment.tracking}}',
      }),
      'zh-TW': simpleEmailBodyTree({
        idPrefix: 'shipment',
        heading: '您的訂單已出貨',
        text: '好消息 — 您的訂單 {{var order.businessId}} 已建立出貨。追蹤號碼：{{var shipment.tracking}}',
      }),
    },
  } as Record<string, unknown>,
  languages: LANGS,
};
