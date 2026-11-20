# PDF fonts (document_templates)

## Noto Sans CJK (Chinese)

- **License:** SIL Open Font License 1.1 (`https://scripts.sil.org/OFL`)
- **Source:** [notofonts/noto-cjk](https://github.com/notofonts/noto-cjk)
  - SC: `Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf` (~16 MB+)
  - TC: `Sans/OTF/TraditionalChinese/NotoSansCJKtc-Regular.otf` (~16 MB+)
- **Why:** Roboto (pdfmake default) has no CJK glyphs. Batch 46 also **forces** the
  resolved Noto family as `defaultStyle.font` (document-renderer used to hard-code
  Roboto, which left Chinese as tofu even when the file was in the image).

Binaries are **not** vendored in git. `pdfmake.ts` resolves them from, in order:

| Face | Env / paths |
| --- | --- |
| SC | `DOCUMENT_TEMPLATES_CJK_FONT_SC`, `DOCUMENT_TEMPLATES_CJK_FONT`, `fonts/NotoSansCJKsc-Regular.otf`, `/usr/share/fonts/truetype/noto/NotoSansCJKsc-Regular.otf` |
| TC | `DOCUMENT_TEMPLATES_CJK_FONT_TC`, `fonts/NotoSansCJKtc-Regular.otf`, `/usr/share/fonts/truetype/noto/NotoSansCJKtc-Regular.otf` |

Document language → face: `zh-TW` / Hant / `zh-HK` → TC (fallback SC); other `zh*` → SC; `en`/`pl` still use SC/TC when present so Chinese **values** print.

### Local drop-in

```bash
curl -fsSL -o packages/modules/document_templates/fonts/NotoSansCJKsc-Regular.otf \
  'https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf'
curl -fsSL -o packages/modules/document_templates/fonts/NotoSansCJKtc-Regular.otf \
  'https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/TraditionalChinese/NotoSansCJKtc-Regular.otf'
```

### Docker / ECS

`backend/Dockerfile` downloads **both** faces and fails the build if either file is ≤ 1 MB.

```bash
docker exec b2b-backend-1 ls -la /usr/share/fonts/truetype/noto/
docker exec b2b-backend-1 stat -c '%n %s' \
  /usr/share/fonts/truetype/noto/NotoSansCJKsc-Regular.otf \
  /usr/share/fonts/truetype/noto/NotoSansCJKtc-Regular.otf
```

Expect each size **> 1 000 000** bytes.
