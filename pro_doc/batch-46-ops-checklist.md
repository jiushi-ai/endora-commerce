# Batch 46 — ops acceptance checklist

Root cause of post-45 tofu: container had Noto, but PDF `defaultStyle.font` stayed **Roboto**.

## Deploy

Rebuild/push **backend** (Dockerfile now pulls SC + TC; `document_templates` forces Noto).

## Verify fonts in container

```bash
docker exec b2b-backend-1 ls -la /usr/share/fonts/truetype/noto/
docker exec b2b-backend-1 stat -c '%n %s' \
  /usr/share/fonts/truetype/noto/NotoSansCJKsc-Regular.otf \
  /usr/share/fonts/truetype/noto/NotoSansCJKtc-Regular.otf
```

Both files should be **> 1 MB**.

## PDF acceptance

1. Buyer Email language = `zh-CN` → issue invoice → Chinese labels **and** company names readable (not □).
2. Buyer Email language = `zh-TW` → issue invoice → Traditional labels readable (TC face).
3. Yellow/red/blue chrome from batch 45 still follows Email language.
