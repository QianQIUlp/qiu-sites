# Continuous-Scene Homepage Acceptance Evidence

This directory records the real-browser acceptance of the homepage 2.5D room on 2026-07-15. Screenshots come from `npm run preview` after `npm run build`; the environment had no Browser plugin, so screenshots, interaction and console checks used the local Playwright Chromium fallback per the repository's testing flow.

## Visual states

- [Desktop overview](./home-overview-1440.webp): 1440 × 900, first-screen resting state.
- [Desk mid-move](./home-writing-midpoint-1440.webp): overview and desk close-up are aligning; this is not a new page after navigation.
- [Desk landing](./home-writing-focus-1440.webp): the real article index lands in the monitor.
- [Workbench landing](./home-projects-focus-1440.webp): real project data lands on the black work mat on the desk.
- [Guitar and life](./home-life-focus-1440.webp): the guitar is focused within the original scene and the life side notes expand.
- [375px overview](./home-mobile-375.webp), [desk](./home-writing-mobile-375.webp), [workbench](./home-projects-mobile-375.webp).
- [768px portrait overview](./home-overview-tablet-768.webp), [desk](./home-writing-tablet-768.webp).
- [Reference composition vs implementation side by side](./reference-vs-home-1440.webp), [headstock and fretboard detail](./guitar-headstock-fretboard-detail.webp).

## Fidelity ledger

| Checkpoint | Result | Evidence and trade-offs |
| --- | --- | --- |
| Single-room composition | Pass | The desk stays rear left, the engineering workbench rear right, and the guitar in the right foreground, keeping the reference image's spatial reading order. |
| Continuous scene, not delayed jump | Pass | After clicking articles or projects the path stays `/`, only `#writing-desk` or `#project-workbench` updates; landing content appears in the original scene. |
| Camera movement | Pass | Within 2.4 seconds it drives base-image zoom, close-up alignment, curtain shift, guitar foreground shift, exposure change and slight walking bob; the mid-move screenshot shows the alignment in progress. |
| Guitar identity details | Pass | Uses a separate foreground of the user's guitar, keeping the aged wine-red body, headstock, pickups and stand, plus the 3/5/7/9/15/17/19/21 dot inlays and the `m` mark spanning frets 11–13. |
| Content and object integration | Pass | The three latest articles are laid out inside the monitor's inner frame, and three real projects in the black work mat's perspective area; no fabricated screenshots, metrics or status. |
| Stable first-screen scale | Pass | `.room-world` is the identity matrix both on load and after 600ms; the old `room-enter` first-screen zoom was removed. |
| 4K and responsive images | Pass | All three spatial masters are 3840 × 2160; a 3840 × 2160 browser actually picks the 3840 × 2160 resource, and small viewports get smaller derivatives output by Astro. |
| Portrait adaptation | Pass | No page-level horizontal overflow at 768px or 375px; portrait landings use in-scene readable panels instead of forcing desktop perspective coordinates. |
| Progressive enhancement | Pass | Under `prefers-reduced-motion: reduce` movement completes instantly and CSS transitions are `0s`; with JavaScript off, the three hash landings and back links work. |

Compared with the static concept image, production has two intentional differences: the decorative floor light ring from the concept is not kept, and the guitar uses the user's specified real-instrument identity details instead of the concept's generic instrument. Both serve real content and an interactive scene, not a visual downgrade.

## Browser check results

- 1440 × 900, 768 × 1024, 375 × 812: page-level horizontal overflow is `0` in all cases.
- The scene matrix is the same before and after homepage load; nothing shrinks from large to small.
- The articles, projects and life states can all return to the overview; `Escape` and browser history state work.
- No console errors or uncaught exceptions during interaction.
- At a 3840 × 2160 viewport the overview image's `naturalWidth × naturalHeight` is `3840 × 2160`.
