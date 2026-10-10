# QStudio Font and Control Glyph Check · 2026-09-30

This fix is based on the commits of personal-site PR #80; the new PR contains only QStudio plus the matching contract and acceptance material.
The subject is the real build output of `npm run build:developer`, served through local Astro preview.
The browser is the Codex built-in Chromium on Windows. Sizes below are the CSS viewports reported by the page; screenshots keep the original images returned by the tool, so pixel sizes may be slightly scaled.

- The final `npm run build:developer` passes and generates two pages, `/` and `/zh/`; no runtime dependencies were added and the personal-site implementation was not changed.
- Six separate WOFF2 files total 231,616 bytes. Source Sans 3 and Noto Sans SC keep real 400–900 weights; Source Serif 4 regular / italic are fixed at weight 400 with optical size 20; Cousine Bold is a real 700. Pinned sources, embedded OFL and internal font names were checked, and the current source's 98 Latin characters and 396 CJK characters are fully covered.
- 28 build-time SVGs each in Chinese and English; after stripping the original character glyphs and the new SVGs, both HTML files have identical text, links, ARIA and native structure. Fonts load successfully; all SVGs are decorative icons and do not enter accessible names.
- Desktop 1440 × 900: glyphs and hierarchy on the English first screen and the Chinese work area render correctly. Lens keyboard Home / End shows the left and right endpoints, and the evidence title at the far left is fully readable; dragging the lens directly and the lower half of the orange handle both update the slider, ARIA value and screenshot position.
- Project groups expand and close by keyboard, keeping native mutually exclusive behavior; the image dialog closes with the SVG close button and Escape, returning focus to the original image link.
- Chinese / English switching keeps `#work` and `#top`; local fonts and icons work on both pages.
- 768 × 1024: English homepage and Chinese work area are readable with no page-level horizontal overflow. 375 × 667: English homepage and project titles are complete. 320 × 667: Chinese and English, the Chinese work area and navigation are readable, with `scrollWidth` equal to `clientWidth`; the previous 320px body minimum was removed so the scrollbar no longer forces 15px of horizontal overflow.
- Font failure: a temporary local server returned 404 for all WOFF2 files. Chinese and English remain readable at 320 × 667, sans / serif / mono / CJK load checks are false, all 28 SVGs remain, and the page has no horizontal overflow.
- The browser logged no script errors or warnings. Not yet re-checked on Safari / Firefox, macOS / Android or a physical touchscreen; real network performance and pixel consistency of font rasterization were not measured.

Original colors, page layout, real product screenshots, copy and links are kept. Both PRs are handed back to the user for review, with auto-merge not enabled.

## Real build screenshots

![English desktop first screen](./en-home-1440.jpg)

![Lens at far left with keyboard focus](./en-lens-left-1440.jpg)

![Chinese work area](./zh-work-1440.jpg)

| English 375px homepage | Chinese 320px homepage | Chinese 320px work area |
| --- | --- | --- |
| ![English homepage](./en-home-375.jpg) | ![Chinese homepage](./zh-home-320.jpg) | ![Chinese work area](./zh-work-320.jpg) |

![320px fallback when all external font requests fail](./font-fallback-zh-320.jpg)
