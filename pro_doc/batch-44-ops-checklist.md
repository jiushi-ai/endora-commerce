# Batch 44 — ops acceptance checklist

Use after deploying a build that includes batch 44 (migration `T145934` + backend/admin/storefront).

## Email language → PDF labels

1. Storefront: sign in as the order’s buyer → `/zh-cn/account` → set **电子邮件语言** to `zh-CN` → Save.
2. Admin: open that buyer’s order → **Issue invoice** (or download PDF).
3. Expect: fixed titles/headers in Chinese (or EN if preference is en-US); company/product **values** unchanged from DB; Chinese names **not** tofu (Docker image must include Noto CJK per `backend/Dockerfile` / `document_templates/fonts/README.md`).

Fallback check: clear preference (or unset) → PDF follows channel `defaultLanguage`, else `en-US`.

## Credit limit (no code)

Admin grants a credit limit to the org → storefront account page shows the credit block.

## Email verified (no code)

Buyer completes `/verify` from the verification mail, or is created via invitation → account shows **已验证**.

## Seller VAT (regression)

Settings → Invoices still required for issue; missing config should surface localized `INVOICE_SELLER_NOT_CONFIGURED` (not a raw English-only hard fail without module sentence).
