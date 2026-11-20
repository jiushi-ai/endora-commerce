# Invoice PDF locale policy (batch 44)

**Status:** binding for Mobii-by-Endora work in batch 44.  
**Not** a Chinese VAT special / fully-digital tax invoice (金税 / 全电票). Endora invoices remain EU-style commercial VAT documents (Faktura layout / numbering).

## Rules

| PDF part | Locale / content source |
| --- | --- |
| Fixed labels (title, table headers, party labels, footer chrome, amount-in-words locale) | Buyer **E-mail language** = `customer_accounts.preferredLanguage` on the order’s customer account |
| Variable values (legal names, addresses, tax IDs, product names, numeric amounts) | Database / order snapshot **as stored** — do not machine-translate |
| Missing glyphs (tofu / □) | Font problem — embed a CJK-capable font in pdfmake; independent of label locale |

## Resolution order (issue invoice from Admin order detail)

1. Order → customer account → `preferredLanguage` (if set and offered)
2. Else sales-channel `defaultLanguage`
3. Else `en-US`

## Implementation note (batch 44)

Upstream `#652` / `#1300` full cherry-pick conflicted with this fork’s layout. Batch 44 **ported** the minimum: `preferredLanguage` column + PATCH + storefront row, then **wired** invoice PDF/email locale to that field (upstream PDF remains `pl-PL` until this wire).

## Explicit non-goals

- Chinese tax-authority e-invoice format, seals, or tax-control numbers
- Driving PDF locale from Admin UI language alone
- Assuming upstream `#652` Email language already wires PDF (it does not; batch 44 adds that wire)
- Chinese amount-in-words (大写); non-`pl` PDFs use English words for the amount line
