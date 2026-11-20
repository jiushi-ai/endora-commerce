# PDF fonts (document_templates)

## Noto Sans CJK SC (Chinese)

- **License:** SIL Open Font License 1.1 (`https://scripts.sil.org/OFL`)
- **Source:** [notofonts/noto-cjk](https://github.com/notofonts/noto-cjk) — `Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf` (~16–30 MB depending on the release artefact)
- **Why:** Roboto (pdfmake default) has no CJK glyphs; Chinese legal names otherwise render as tofu (□).
- **Min size:** a healthy download is well over **1 MB** (typically ~16 MB+; treat ~30 MB as a normal upper band for related Noto CJK packs). `backend/Dockerfile` fails the image build if the file is ≤ 1 000 000 bytes (truncated HTML / failed curl).

The binary is **not** vendored in git. `pdfmake.ts` resolves it from, in order:

1. `DOCUMENT_TEMPLATES_CJK_FONT` (absolute path)
2. `fonts/NotoSansCJKsc-Regular.otf` next to this README (local drop-in)
3. `/usr/share/fonts/truetype/noto/NotoSansCJKsc-Regular.otf` (backend Docker image)

If none exist, the process logs a one-time warning and Chinese text will tofu.

### Local drop-in

```bash
curl -fsSL -o packages/modules/document_templates/fonts/NotoSansCJKsc-Regular.otf \
  'https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf'
```

### Docker / ECS check

`backend/Dockerfile` downloads the same file into `/usr/share/fonts/truetype/noto/` at image build time and asserts size `> 1000000`.

On a running backend container (ECS task / `docker exec`):

```bash
ls -la /usr/share/fonts/truetype/noto/NotoSansCJKsc-Regular.otf
stat -c '%n %s' /usr/share/fonts/truetype/noto/NotoSansCJKsc-Regular.otf
# expect size >> 1000000 (often ~16MB+)
```
