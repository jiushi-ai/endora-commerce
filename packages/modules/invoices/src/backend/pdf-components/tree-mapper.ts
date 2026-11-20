import type { Content } from 'pdfmake/interfaces.js';
import type { InvoiceDetail } from '@endora-commerce/contracts';
import type { AmountToWordsLocale } from '../services/amount-to-words.js';
import {
  headerSection,
  partiesSection,
  lineItemsSection,
  vatSummarySection,
  totalsSection,
  notesSection,
  footerSection,
  spacerSection,
  dividerSection,
  logoSection,
} from './sections.js';

/**
 * This module's own invoice template blocks — the ten it renders itself.
 *
 * A block another module declares is rendered by that module, through
 * `invoicePdfBlockRegistry` (`specs/134-paid-module-extraction/` T063). Since
 * feature 152 the document-template engine walks the tree; this file maps one
 * own block to its section builder.
 */
export const INVOICE_COMPONENT_NAMES = [
  'invoices.InvoiceHeader',
  'invoices.InvoiceParties',
  'invoices.InvoiceLineItems',
  'invoices.InvoiceVatSummary',
  'invoices.InvoiceTotals',
  'invoices.InvoiceNotes',
  'invoices.InvoiceSpacer',
  'invoices.InvoiceDivider',
  'invoices.InvoiceLogo',
  'invoices.InvoiceFooter',
] as const;
export type InvoiceComponentName = (typeof INVOICE_COMPONENT_NAMES)[number];

/** What the renderer hands every own-block mapper beyond the stored props. */
export interface OwnBlockRenderOptions {
  /** A present, placed contributed block prints the KSeF number (T137). */
  readonly suppressKsefNumber?: boolean;
  /** Batch 44 — preferred / channel document language for fixed chrome labels. */
  readonly documentLanguage?: string | null;
}

type Mapper = (
  props: Record<string, unknown>,
  inv: InvoiceDetail,
  locale: AmountToWordsLocale,
  options: OwnBlockRenderOptions,
) => Content;

const COMPONENT_MAP: Record<InvoiceComponentName, Mapper> = {
  'invoices.InvoiceHeader': (p, inv, _locale, options) =>
    headerSection(inv, p, options, options.documentLanguage),
  'invoices.InvoiceParties': (p, inv, _locale, options) =>
    partiesSection(inv, p, options.documentLanguage),
  'invoices.InvoiceLineItems': (p, inv, _locale, options) =>
    lineItemsSection(inv, p, options.documentLanguage),
  'invoices.InvoiceVatSummary': (p, inv, _locale, options) =>
    vatSummarySection(inv, p, options.documentLanguage),
  'invoices.InvoiceTotals': (p, inv, locale, options) =>
    totalsSection(inv, locale, p, options.documentLanguage),
  'invoices.InvoiceNotes': (p, inv) => notesSection(p, inv),
  'invoices.InvoiceSpacer': (p) => spacerSection(p),
  'invoices.InvoiceDivider': (p) => dividerSection(p),
  'invoices.InvoiceLogo': (p) => logoSection(p),
  'invoices.InvoiceFooter': (p, inv, _locale, options) =>
    footerSection(p, inv, options.documentLanguage),
};

/** Render one of this module's own blocks — `undefined` for any other name. */
export function renderOwnBlock(
  name: string,
  props: Record<string, unknown>,
  inv: InvoiceDetail,
  locale: AmountToWordsLocale,
  options: OwnBlockRenderOptions = {},
): Content | undefined {
  if (!(name in COMPONENT_MAP)) return undefined;
  return COMPONENT_MAP[name as InvoiceComponentName](props, inv, locale, options);
}
