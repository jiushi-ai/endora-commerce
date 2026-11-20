# Batch 45 — ops acceptance checklist

Follows batch 44. Deploy a backend image rebuilt after the Dockerfile size gate, plus invoices package with `chromeStr` / seed revision 3.

## Chrome labels follow document language

1. Storefront: buyer Email language = `zh-CN`.
2. Issue / download invoice PDF (even if the generic template still has old English yellow-box props in DB).
3. Expect: fixed chrome in Chinese (`开票日期`, `已付`, `应付金额`, …) — not English `Issue date` / `Paid`.
4. Optional: set a **custom** non-stock label in the template builder (e.g. `Acme issue day`) → that string still appears.

## CJK font in the container

```bash
# ECS task / docker exec into backend
ls -la /usr/share/fonts/truetype/noto/NotoSansCJKsc-Regular.otf
stat -c '%n %s' /usr/share/fonts/truetype/noto/NotoSansCJKsc-Regular.otf
```

Expect size **> 1 000 000** bytes (typically ~16 MB+; related packs can approach ~30 MB). If missing or tiny, Chinese names tofu (□) and the process may have logged the one-time Noto warning — rebuild the image (Dockerfile fails the build on size ≤ 1 MB).

See also `packages/modules/document_templates/fonts/README.md`.
