# Homepage Font and Control Glyph Check · 2026-09-30

The subject is the root site output of `npm run build`, served locally through Astro preview.
This check used the Codex built-in Chromium browser on Windows; the sizes below are the actual page viewports and screenshot sizes.

- `npm run build` passes and generates 20 pages. The existing warning about the Three.js module exceeding 500 kB remains; no runtime dependencies were added.
- The homepage self-hosts Arimo / Gelasio / Cousine / Noto Sans SC / Noto Serif SC. The seven WOFF2 files total 333,100 bytes, of which a 3,612-byte display subset is inlined into CSS by Vite; these are asset sizes, and actual network time or performance metrics were not measured.
- Font sources are pinned to specific Google Fonts commits; the full OFL license is stored with the assets and embedded in the WOFF2 name table, and the deployed files also carry copyright and license. The font generation script passes coverage assertions for the current homepage CJK and display characters; the pedal Roman-numeral scale uses ASCII.
- Desktop 1440 × 900: glyphs and arrows on the English homepage, `#trace` and `#music` render correctly; SVGs stay in sync with button labels and state for trace start and clear, the local sound toggle, recording completion, play/pause, overdub save and clear.
- The final build additionally checked the English music area at 1280 × 720 and the scale at 375 × 667, confirming ASCII Roman numerals and self-hosted fonts load correctly.
- Small screen 375 × 667: the Chinese homepage, Chinese and English music areas, English projects area and the dark guitar close-up are usable with no page-level horizontal overflow; the separate horizontal pedal region is kept. Project nameplates and canvas text use the homepage font stack.
- `#paths` play/stop icons stay in sync with `aria-pressed`; the glyph cache for 「确定」 ("OK") in `#blindspot` uses the loaded display font. Chinese/English switching keeps the current `#music` / `#blindspot` position.
- Failure scenario: a temporary local server returned 404 for external WOFF2 files and failed only the first audio initialization. Confirmed that sans/serif fonts did not load, system fallback text stayed readable, SVGs remained and the page had no horizontal overflow. When sound is unavailable the icon is hidden; after a successful retry the arrow and `aria-pressed=true` return. The inlined display subset still works.
- The browser logged no new script errors; the pre-existing Three.js environment-map sampling warning remains. Not tested on Safari / Firefox, macOS / Android or a physical touchscreen; real audio output, form submission and performance metrics were not verified.

Fonts, content and themes of reading pages and QStudio are out of scope for this change. The spatial discovery entry is kept and no first-screen navigation was added.

## Real build screenshots

![English homepage, 1440 × 900](./en-home-1440.jpg)

![English trace area, 1440 × 900](./en-trace-1440.jpg)

![English music area, 1280 × 720](./en-music-1280.jpg)

| Chinese homepage, 375 × 667 | English music area, 375 × 667 | Guitar close-up, 375 × 667 |
| --- | --- | --- |
| ![Chinese homepage](./zh-home-375.jpg) | ![English music area](./en-music-375.jpg) | ![Guitar close-up](./en-guitar-375.jpg) |

![Fallback when external font requests fail, 1280 × 720](./font-fallback-1280.jpg)
