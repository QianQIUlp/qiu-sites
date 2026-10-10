# Person-first reveal · Design QA

## Creative source

- Governing art direction: `docs/uiux/homepage-art-direction.md`
- Long-term intent and PR #66 baseline: `docs/uiux/person-first-intent.md`
- Current material/interaction contract: `docs/uiux/ink-and-light-study.md`

The current review no longer treats the old interactive-room reference as the final target. The target is the
user's stated feeling: **东西很多，初见很少** ("many things, little at first sight") — first meet Qiu, the guitar, and lived experience; let writing
and engineering emerge from shadow only after the visitor approaches.

## Current screenshot evidence

All images below were captured from the production build in headless Chromium on 2026-07-21. The complete set
and viewport manifest live in `docs/qa/screenshots/person-first-reveal/`.

- Initial night composition: `home-initial-dark-1440.webp`
- Writing area discovered on hover/focus: `home-discover-writing-dark-1440.webp`
- Life close view with real article traces: `home-life-dark-1440.webp`
- Returned room after discovery: `home-discovered-dark-1440.webp`
- Same initial composition in day mode: `home-initial-light-1440.webp`
- Initial/returned mobile states: `home-initial-dark-375.webp`, `home-discovered-dark-375.webp`
- Interior continuity: `blog-light-1440.webp`, `projects-dark-1440.webp`, `post-light-1440.webp`, `post-dark-375.webp`

## Visual findings

- **First glance:** full navigation, writing, projects, counts, and status copy no longer compete with the person.
  The title and guitar remain concrete; the room drops to a low-contrast field and the single life label stays near
  the instrument.
- **Discovery:** hovering or keyboard-focusing a shadowed desk lets the room and its label return together. Selecting
  any object releases the veil; returning to the overview reveals the complete navigation and, on mobile, the three
  destination dock items. There is no visible step counter, tutorial panel, or “next” workflow.
- **Day/night:** both themes keep the same composition. Night lets the room fall into black ink; day lets it recede
  into the paper while the guitar remains materially present.
- **Living person:** the first screen uses one short life fragment rather than a biography. The life close view then
  connects the guitar metaphor to two existing reflective essays before showing external profiles.
- **One world:** blog, projects, and article pages use the page itself as paper. Unnecessary card fills, rounded paper
  boxes, duplicate seals, and hard image borders are gone; hierarchy comes from spacing, ink lines, and fading edges.
- **Restraint:** QiuBrush now appears only in the TOC title and fallback cover signature. The interface no longer
  displays a Seal, and ordinary links no longer inherit cinnabar through `--warm`.

## Runtime and accessibility evidence

- `npm run build`: passed; 10 static pages generated.
- Browser console/page errors: 0 across tested states.
- Page-level horizontal overflow: 0 at 1440px and 375px on home, blog, projects, and representative article routes.
- Mobile theme and visible navigation targets: 44px; room destination targets: 44px minimum.
- Reduced motion: selecting Writing settles immediately (`data-room-moving="false"`) and exposes the panel.
- No JavaScript: `#writing-desk` remains visible with opacity `1`; native links and hash targets remain usable.
- Initial homepage navigation is visually and interactively hidden, not removed from the no-JS fallback. After any
  room choice, it returns with the rest of the discovered room.

## Review conclusion

No unresolved functional or responsive defect was found in the tested routes. The screenshots are evidence of the
implemented hierarchy, not a substitute for the author's final aesthetic judgment; future homepage work must begin
from the original words in `homepage-art-direction.md`, not from this pass/fail document.

---

# Annotated liquid-glass workbench · Design QA

## Source and implementation

- Source annotation: `/home/qiu/.codex/attachments/42ee63a8-0a12-4dc8-ad1c-a65be874f3f0/codex-clipboard-7e0764a4-a9d5-47db-bf16-6e3c09bc5997.png`
- Desktop light, 1639 × 826: `docs/qa/screenshots/room-photoreal-pair/light-project-workbench.png`
- Desktop dark, 1639 × 826: `docs/qa/screenshots/room-photoreal-pair/dark-project-workbench.png`
- Mobile light, 375 × 812: `docs/qa/screenshots/room-photoreal-pair/light-mobile-project-workbench.png`

## Comparison history

1. The first implementation filled the three red regions literally, used thick blur on every card, and also gave
   the theme and return controls the same glass material. Mobile still showed the center of the panorama instead of
   the requested Supro focus.
2. The final implementation keeps the three red-region anchors but tightens their dimensions into an asymmetric
   upper-left / lower-left / lower-right composition. Blur and tint were reduced so the wall, rack, wood, and amp
   remain legible through each card. The theme and return controls are now opaque ordinary controls.
3. Mobile uses an 88% horizontal crop anchor on the project focus image and slightly staggered card widths, keeping
   Supro and the wood worktop visibly present behind the project links.

## Final review

- No card is tilted; all three sit on stable horizontal and vertical axes.
- The three project links are the only elements using backdrop blur, translucent tint, refractive rim, and glass shadow.
- Project names, metadata, status, and action cues remain readable in both themes and at 375px.
- The source's three annotated placement regions are respected without covering the pedals or the Supro control panel
  on desktop.
- `npm run build` passes with 10 static pages generated; `git diff --check` passes.

final result: passed

# Author-annotated workbench positions and serif identity · Design QA

## Sources and implementation

- Font source crop: `/home/qiu/.codex/attachments/4f1ff16c-3893-4ddf-a7a3-1dd554faeffb/codex-clipboard-82a176c6-98dc-42c7-bd06-10418f77b7d1.png`
- Position source, 1630 × 816: `/home/qiu/.codex/attachments/8d34a0dd-3fe0-458a-982c-f4dcb616cbe1/codex-clipboard-b1c4c8e5-1e88-47f1-8b31-5524fad268a1.png`
- Homepage implementation, dark, 1630 × 816: `docs/qa/screenshots/room-photoreal-pair/dark-overview-serif.png`
- Workbench implementation, dark, 1630 × 816: `docs/qa/screenshots/room-photoreal-pair/dark-project-workbench.png`

## Measured comparison

- “我是千秋。” ("I am Qianqiu.") now uses the same `var(--font-serif)` and 700 weight as the project-page heading
  “作品与探索” ("Works and explorations"); QiuBrush is not applied.
- MealCircuit occupies x 179–628 / y 126–354, matching the annotated upper-left region.
- Crewlight occupies x 200–580 / y 515–743, matching the annotated lower-left region.
- Docker-Hadoop-Cluster occupies x 779–1480 / y 407–728, matching the annotated lower-right region.
- The desktop percentages are calibrated against the 16:9 room canvas rather than the viewport, so the positions
  preserve the measured screenshot coordinates when the scene canvas is taller than the viewport.

## Final review

- No unresolved P0/P1/P2 position or typography mismatch remains in the same-state comparison.
- Existing liquid-glass material, links, theme behavior, mobile rules, and return control remain unchanged.
- `npm run build` and `git diff --check` pass.

final result: passed

---

# Universal collapsible article TOC · Design QA

## Evidence

- Closed desktop state, 1630 × 816: `docs/qa/screenshots/post-toc-drawer/dark-closed-1630.png`
- Open desktop state, 1630 × 816: `docs/qa/screenshots/post-toc-drawer/dark-open-1630.png`
- Open light-theme state, 1630 × 816: `docs/qa/screenshots/post-toc-drawer/light-open-1630.png`
- Heading-free essay, 1630 × 816: `docs/qa/screenshots/post-toc-drawer/dark-open-qiyuniao-1630.png`
- Open mobile state, 375 × 812: `docs/qa/screenshots/post-toc-drawer/dark-open-375.png`

## Functional review

- All seven generated article routes contain exactly one `data-toc-drawer`; the feature no longer depends on a
  per-article `toc` frontmatter flag.
- The representative SSH article exposes 39 links. The heading-free essay exposes one useful fallback link,
  「文章开头」 ("Start of article"), instead of an empty drawer.
- The same native summary control opens and closes the drawer on successive clicks. The article width and scroll
  position do not reflow when the drawer changes state. When closed, the panel computes to `display: none` and
  exposes zero focusable TOC links.
- At 1630px and 375px, the drawer stays anchored to the viewport's left-middle and page-level horizontal overflow is 0.
- The long desktop and mobile TOCs scroll inside their own panel; the page remains independently scrollable.

## Final review

- `npm run build` passes with 10 static pages generated.
- `git diff --check` passes.

final result: passed
