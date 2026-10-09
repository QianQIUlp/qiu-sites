# Personal Space Integration Check · 2026-09-22

The subject is the root site build output from `npm run build`, served through Astro preview.

- `npm run build` passes and generates 20 pages. Vite warns that the module containing Three.js exceeds 500 kB; no packages were added, and neither the audio algorithm nor the guitar geometry was changed.
- Assets and internal links on the Chinese and English homepages all point to real build files; there are no `_room` / `rewrite.html` prototype paths, and canonical, alternate, robots and sitemap use me.qiu.works.
- English keeps 「千秋」 (Qianqiu, the Chinese name); interface labels are translated. Switching language keeps `#music`; recording and sound state reset on page navigation.
- Desktop 1440 × 900: open the guitar, switch to the headstock, go back; gold tone, keyboard Gain adjustment, Em chord, strumming, 6-second recording, overdub and mute all work.
- Tablet 768 × 1024: English loose-leaf pages and the new archive navigation; links go to `/en/blog/` and `/en/projects/` respectively.
- Small screen 375 × 667: English homepage, music area and the line-drawing entry have no page-level horizontal overflow; the pedals keep their own horizontal region, and drawing start and clear both work.
- The interaction checks above showed no browser console errors or warnings. The browser's reduced-motion preference was active; the prototype's motion toggle and photo fallback are kept. No separate tests were done on a physical touchscreen, without WebGL, or with JS disabled.
- The homepage share images are 1200 × 630 captures of the real page: see [Chinese](../../../public/assets/og/me-zh.jpg) / [English](../../../public/assets/og/me-en.jpg).

## Real build screenshots

![Guitar close-up](./guitar.jpg)

![Playable pedalboard](./pedalboard.jpg)

| Small-screen homepage | Small-screen music area |
| --- | --- |
| ![Small-screen homepage](./mobile-home.jpg) | ![Small-screen music](./mobile-music.jpg) |

Not published to Cloudflare, and its domain bindings were not changed. The QStudio app and unpushed commits in the original directory were left as they were.
