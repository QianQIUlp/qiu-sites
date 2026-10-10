# Homepage fonts

Self-hosted WOFF2 subsets, used only by `/` and `/en/`. Each family is licensed
under SIL OFL 1.1; the complete licenses are beside these assets and embedded in
each WOFF2 name table, so deployed files also carry the copyright and license.

Official sources are pinned to Google Fonts commit
[`23e54b51ddffbc7713c583748e3bd86f62b1fa4a`](https://github.com/google/fonts/tree/23e54b51ddffbc7713c583748e3bd86f62b1fa4a/ofl).

| Family | Source under `ofl/` | Local source filename | Use |
| --- | --- | --- | --- |
| Arimo | `arimo/Arimo[wght].ttf` | `arimo.ttf` | Arial-compatible Latin UI, 400–700 |
| Gelasio | `gelasio/Gelasio[wght].ttf` | `gelasio.ttf` | Georgia-compatible Latin serif, 400–700 |
| Gelasio Italic | `gelasio/Gelasio-Italic[wght].ttf` | `gelasio-italic.ttf` | English italic, 400 |
| Cousine | `cousine/Cousine-Regular.ttf` | `cousine.ttf` | Monospace labels, 400 |
| Noto Sans SC | `notosanssc/NotoSansSC[wght].ttf` | `noto-sans-sc.ttf` | Source-used CJK UI, 400–900 |
| Noto Sans SC | same source | same source | Small display subset `千秋确定空`, 900 |
| Noto Serif SC | `notoserifsc/NotoSerifSC[wght].ttf` | `noto-serif-sc.ttf` | Source-used CJK serif, 400 |
| Long Cang | `longcang/LongCang-Regular.ttf` | `long-cang.ttf` | Pencil handwriting for drafts and notes, CJK only |
| Caveat | `caveat/Caveat[wght].ttf` | `caveat.ttf` | Pencil handwriting for drafts and notes, Latin only, 450 |

Arimo and Gelasio retain the prior Latin metrics. Cousine is Courier New
compatible, so its small labels are checked for fit. Chinese display glyphs stay
selectable HTML text; canvas glyph caches are refreshed after the same font loads.
The handwriting faces ("Me Hand") cover only the strings between the
`// hand-font:start` / `// hand-font:end` markers in the homepage components
(`src/components/me/*.astro`): the page drafts and the pencil notes.
The small display subset is inlined into the homepage stylesheet by Vite. The
primary Latin sans, and serif on English pages, have explicit font preloads.

To regenerate after adding homepage text, download these pinned TTFs and the seven
families' `OFL.txt` files into a temporary directory, renaming licenses to
`arimo-OFL.txt`, `gelasio-OFL.txt`, `cousine-OFL.txt`, `noto-sans-sc-OFL.txt`,
`noto-serif-sc-OFL.txt`, `long-cang-OFL.txt`, `caveat-OFL.txt`.
Run `python scripts/subset-me-fonts.py <source-directory>` in a Python environment
with `fonttools` and `brotli`. The script derives character coverage from homepage
components, layout and interaction modules, preserving all ASCII for live values.
It asserts CJK coverage and reports file sizes. No font tooling is needed to build
or serve the website.
