import type { InvoiceDetail } from '@endora-commerce/contracts';

/**
 * Fixed chrome labels for invoice PDFs (batch 44). Variable values (names,
 * addresses, product names, amounts) stay as stored — never machine-translated.
 */
export interface InvoicePdfLabels {
  readonly titles: Record<InvoiceDetail['kind'], string>;
  readonly numberPrefix: string;
  readonly labelKsefNumber: string;
  readonly labelIssuedAt: string;
  readonly labelSaleDate: string;
  readonly labelPaymentDue: string;
  readonly labelPaymentMethod: string;
  readonly sellerLabel: string;
  readonly buyerLabel: string;
  readonly taxIdLabel: string;
  readonly colLp: string;
  readonly colName: string;
  readonly colUnit: string;
  readonly colQty: string;
  readonly colUnitNet: string;
  readonly colTax: string;
  readonly colNet: string;
  readonly colGross: string;
  readonly vatRate: string;
  readonly vatNet: string;
  readonly vatAmount: string;
  readonly vatGross: string;
  readonly totalLabel: string;
  readonly labelPaid: string;
  readonly labelAmountDue: string;
  readonly labelOverpayment: string;
  readonly labelGross: string;
  readonly labelInWords: string;
  readonly footerDefault: string;
}

const EN: InvoicePdfLabels = {
  titles: {
    invoice: 'Invoice',
    proforma: 'Proforma invoice',
    correction: 'Credit note',
    wz: 'Delivery note',
  },
  numberPrefix: 'No.',
  labelKsefNumber: 'KSeF number',
  labelIssuedAt: 'Issue date',
  labelSaleDate: 'Sale date',
  labelPaymentDue: 'Payment due',
  labelPaymentMethod: 'Payment method',
  sellerLabel: 'Seller',
  buyerLabel: 'Buyer',
  taxIdLabel: 'Tax ID',
  colLp: 'No.',
  colName: 'Name',
  colUnit: 'Unit',
  colQty: 'Qty',
  colUnitNet: 'Unit net',
  colTax: 'Rate',
  colNet: 'Net',
  colGross: 'Gross',
  vatRate: 'VAT rate',
  vatNet: 'Net',
  vatAmount: 'VAT',
  vatGross: 'Gross',
  totalLabel: 'Total',
  labelPaid: 'Paid',
  labelAmountDue: 'Amount due',
  labelOverpayment: 'Overpayment',
  labelGross: 'Total',
  labelInWords: 'In words',
  footerDefault: 'Thank you for your business.\n{{var seller.legalName}} · Tax ID {{var seller.taxId}}',
};

const PL: InvoicePdfLabels = {
  titles: {
    invoice: 'Faktura',
    proforma: 'Faktura proforma',
    correction: 'Faktura korygująca',
    wz: 'Dokument WZ',
  },
  numberPrefix: 'nr',
  labelKsefNumber: 'Numer w KSeF',
  labelIssuedAt: 'Data wystawienia',
  labelSaleDate: 'Data sprzedaży',
  labelPaymentDue: 'Termin płatności',
  labelPaymentMethod: 'Metoda płatności',
  sellerLabel: 'Sprzedawca',
  buyerLabel: 'Nabywca',
  taxIdLabel: 'NIP',
  colLp: 'Lp',
  colName: 'Nazwa',
  colUnit: 'Jedn.',
  colQty: 'Ilość',
  colUnitNet: 'Cena netto',
  colTax: 'Stawka',
  colNet: 'Wartość netto',
  colGross: 'Wartość brutto',
  vatRate: 'Stawka VAT',
  vatNet: 'Wartość netto',
  vatAmount: 'Kwota VAT',
  vatGross: 'Wartość brutto',
  totalLabel: 'Razem',
  labelPaid: 'Zapłacono',
  labelAmountDue: 'Do zapłaty',
  labelOverpayment: 'Nadpłata',
  labelGross: 'Razem',
  labelInWords: 'Słownie',
  footerDefault: 'Dziękujemy za współpracę.\n{{var seller.legalName}} · NIP {{var seller.taxId}}',
};

const ZH_CN: InvoicePdfLabels = {
  titles: {
    invoice: '发票',
    proforma: '形式发票',
    correction: '贷项通知单',
    wz: '发货单',
  },
  numberPrefix: '编号',
  labelKsefNumber: 'KSeF 编号',
  labelIssuedAt: '开票日期',
  labelSaleDate: '销售日期',
  labelPaymentDue: '付款期限',
  labelPaymentMethod: '付款方式',
  sellerLabel: '卖方',
  buyerLabel: '买方',
  taxIdLabel: '税号',
  colLp: '序号',
  colName: '名称',
  colUnit: '单位',
  colQty: '数量',
  colUnitNet: '净单价',
  colTax: '税率',
  colNet: '净额',
  colGross: '总额',
  vatRate: '增值税税率',
  vatNet: '净额',
  vatAmount: '增值税',
  vatGross: '总额',
  totalLabel: '合计',
  labelPaid: '已付',
  labelAmountDue: '应付金额',
  labelOverpayment: '多付',
  labelGross: '合计',
  labelInWords: '大写',
  footerDefault: '感谢惠顾。\n{{var seller.legalName}} · 税号 {{var seller.taxId}}',
};

const ZH_TW: InvoicePdfLabels = {
  ...ZH_CN,
  titles: {
    invoice: '發票',
    proforma: '形式發票',
    correction: '貸項通知單',
    wz: '出貨單',
  },
  numberPrefix: '編號',
  labelKsefNumber: 'KSeF 編號',
  labelIssuedAt: '開立日期',
  labelSaleDate: '銷售日期',
  labelPaymentDue: '付款期限',
  labelPaymentMethod: '付款方式',
  sellerLabel: '賣方',
  buyerLabel: '買方',
  taxIdLabel: '稅號',
  colLp: '序號',
  colName: '名稱',
  colUnit: '單位',
  colQty: '數量',
  colUnitNet: '淨單價',
  colTax: '稅率',
  colNet: '淨額',
  colGross: '總額',
  vatRate: '增值稅稅率',
  vatNet: '淨額',
  vatAmount: '增值稅',
  vatGross: '總額',
  totalLabel: '合計',
  labelPaid: '已付',
  labelAmountDue: '應付金額',
  labelOverpayment: '多付',
  labelGross: '合計',
  labelInWords: '大寫',
  footerDefault: '感謝惠顧。\n{{var seller.legalName}} · 稅號 {{var seller.taxId}}',
};

const BY_BASE: Record<string, InvoicePdfLabels> = {
  en: EN,
  pl: PL,
  'zh-cn': ZH_CN,
  'zh-tw': ZH_TW,
  zh: ZH_CN,
};

/** Collect stock chrome strings used by seed/editor defaults across locales. */
function chromeStringsOf(catalog: InvoicePdfLabels): string[] {
  return [
    ...Object.values(catalog.titles),
    catalog.numberPrefix,
    catalog.labelKsefNumber,
    catalog.labelIssuedAt,
    catalog.labelSaleDate,
    catalog.labelPaymentDue,
    catalog.labelPaymentMethod,
    catalog.sellerLabel,
    catalog.buyerLabel,
    catalog.totalLabel,
    catalog.labelPaid,
    catalog.labelAmountDue,
    catalog.labelOverpayment,
    catalog.labelGross,
    catalog.labelInWords,
    catalog.footerDefault,
  ];
}

/**
 * Stock chrome from EN / PL / zh-CN / zh-TW (and historical EN/PL footer copy).
 * Template props that equal any of these yield to `invoicePdfLabels` at render.
 */
const STOCK_CHROME_LABELS: ReadonlySet<string> = new Set(
  [EN, PL, ZH_CN, ZH_TW].flatMap(chromeStringsOf).map((s) => s.trim()).filter(Boolean),
);

/**
 * True when `text` (trimmed) matches a built-in chrome string from any supported
 * catalog — including the English / Polish footer defaults that older seeds stored.
 */
export function isStockChromeLabel(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length > 0 && STOCK_CHROME_LABELS.has(trimmed);
}

/** Labels for a document language; unknown tags fall back to English. */
export function invoicePdfLabels(documentLanguage: string | undefined | null): InvoicePdfLabels {
  if (!documentLanguage) return PL;
  const lower = documentLanguage.toLowerCase();
  if (BY_BASE[lower]) return BY_BASE[lower]!;
  const base = lower.split('-')[0] ?? lower;
  if (base === 'zh') {
    return lower.includes('tw') || lower.includes('hant') ? ZH_TW : ZH_CN;
  }
  return BY_BASE[base] ?? EN;
}
