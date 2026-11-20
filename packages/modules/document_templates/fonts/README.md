# PDF fonts (document_templates)

## Noto Sans CJK SC (Chinese)

- **License:** SIL Open Font License 1.1 (`https://scripts.sil.org/OFL`)
- **Source:** [notofonts/noto-cjk](https://github.com/notofonts/noto-cjk) — `Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf` (~16 MB)
- **Why:** Roboto (pdfmake default) has no CJK glyphs; Chinese legal names otherwise render as tofu (□).

The binary is **not** vendored in git. `pdfmake.ts` resolves it from, in order:

1. `DOCUMENT_TEMPLATES_CJK_FONT` (absolute path)
2. `fonts/NotoSansCJKsc-Regular.otf` next to this README (local drop-in)
3. `/usr/share/fonts/truetype/noto/NotoSansCJKsc-Regular.otf` (backend Docker image)

### Local drop-in

```bash
curl -fsSL -o packages/modules/document_templates/fonts/NotoSansCJKsc-Regular.otf \
  'https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf'
```

### Docker

`backend/Dockerfile` downloads the same file into `/usr/share/fonts/truetype/noto/` at image build time.
