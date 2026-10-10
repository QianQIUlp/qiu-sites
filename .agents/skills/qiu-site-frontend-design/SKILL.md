---
name: qiu-site-frontend-design
description: Repo-specific visual design workflow for Qiu's Astro personal site. Use when reviewing or refining its modern room direction, typography, layout, hierarchy, responsive behavior, and long-form reading experience without changing routes, schemas, frameworks, or runtime dependencies.
---

# Qiu Site Frontend Design

Use this skill for UI/UX design judgment on this repository only. It adapts general frontend-design guidance to Qiu's
Astro static site and must only read local repository files.

## Current Homepage Override · 2026-09-22

The user approved the bilingual immersive prototype for `me.qiu.works` and its integration into Astro. For `/` and `/en/`, follow the latest section of `docs/uiux/ink-and-light-study.md` and `docs/me-home.md`. The legacy room-photo composition, frozen homepage copy, project-entry pedal positions and dual-homepage-theme rules below are historical and do not govern this approved replacement. Preserve their historical quotes and audits. Reading routes still retain their content and Light/Dark themes; `developer/` remains governed separately.

Keep the approved Chinese name in both languages, real guitar model, spatial exploration, playable four-pedal audio chain, six-second looper and draw-to-pluck scene. Reuse the bundled Three.js and native Web Audio; no new framework is needed. Verify changed behavior proportionately, including production asset paths, localized navigation and narrow-screen usability. Update this skill with the active contract when these boundaries change.

As of 2026-10-09 the agreed homepage vision is `docs/uiux/open-world-brief.md`; read it first. The home room keeps the Three.js guitar: large, tilted, centred, turning to follow the mouse (disabled only by reduced motion or the motion toggle); clicking picks it up into the close-up dialog. It makes no sound; sound lives in the strings room. Improve how it looks (materials, lighting) against the Rāna photograph, never replace it with a photo. Its home render uses `lighting.room()` (window-warm key from the upper right, cast shadow to the lower left); the close-up uses `lighting.studio()`. The finish follows ESP's Distressed See Thru Wine Red nitro relic: checking only on the flamed maple top's remaining lacquer, under a gloss coat that still reflects (Qiu: the cracks matter more than any matte look), with bare wood matte and crack-free, a chatoyant flame, natural binding, mahogany back and sides, and a scraped neck back from `esp-rana-back.webp`. The neck is one lofted piece with a volute and a heel block, the tuners are GOTOH with rounded buttons, there are strap buttons on the bass horn and the tail, and the knobs are clear amber top hats. In the close-up, left-drag turns and right-drag moves anywhere along the guitar; a visible legend must explain both. See the 2026-10-08 section of `docs/uiux/ink-and-light-study.md`. A viewport-fixed daylight layer and the lamp-lit strings room are described in the 2026-10-08 section of `docs/uiux/ink-and-light-study.md`. For the user-approved portrait hierarchy (2026-09-24), keep the Three.js guitar unconditional and prominent. Let the name, one greeting and one main invitation lead; use one short localized guitar hint. Keep scene doors, the room map and the motion control available while hiding duplicate explanation and manual zoom/overview controls. Scope these changes to narrow portrait layouts; leave desktop and landscape composition intact.

The pedalboard room (琴弦之间, "Between the Strings") is the most crafted part of the site; see the 2026-10-10 section of `docs/uiux/ink-and-light-study.md`. The board reads left to right: guitar → Centaur → BOSS BD-2 → BOSS PS-6 Harmonist → After Hours tape echo → out; never mirror it. Pedals are inline SVG objects scaled by one `--u` unit, knobs (`PedalKnob.astro`) turn around their shaft while their lighting stays still, stomps press and click, LEDs spill light, and the Harmonist plays a real diatonic harmony. The VU meter reads before the limiter so its red zone and PEAK lamp are reachable by pushing levels. On phones the board pages one centred pedal at a time with snapping swipes and CENTAUR / BD-2 / PS-6 / ECHO tabs. Pedal styles live in `src/styles/me/pedals.css`.

Step 3 gives every other room one idea of its own; read the 2026-10-10 "Loose pages and letting go" section of `docs/uiux/ink-and-light-study.md`. A released pan coasts and only settles onto a room when it stops close to one. Loose pages are paper in `.paper-layer` (`papers.js`, `papers.css`): thrown, they glide, land and may slide into another room for the visit; held up into the `.paper-sun` window patch they glow and show their mirrored back and an erased pencil draft in "Me Hand". Keep drafts true to their essays and inside the `hand-font` markers so the handwriting subset covers them.

Discoverability is a quiet tutorial, never instructions up front (round 2, `hints.js`): objects answer attention (hover lift), each room demonstrates its trick once after a calm moment, then a pencil note in "Me Hand" writes itself in beside the object and rubs out once the visitor has done it (`me-found`). New rooms register a lesson there. 不赶时间 ("No hurry", `afternoon.js`) is the time of day: it moves only while the visitor is still, and `--hour`/`--gold`/`--dusk` on `#room` carry the evening into every room (daylight layers, the papers patch, the guitar's lighting); keep new light effects reading those variables rather than fixing an afternoon.

For the 2026-09-30 font consistency fix, homepage text uses the self-hosted Arimo,
Gelasio, Cousine, Noto Sans SC and Noto Serif SC assets in `src/assets/me/fonts/`, plus the
Long Cang and Caveat handwriting subsets used only by the pencil drafts and notes.
Preserve the sans/serif/mono roles and the small 900-weight Chinese display subset.
UI arrows and control symbols use shared inline SVG in `Icon.astro` / `icons.js`,
including dynamic states. Keep fallback text readable; refresh cached canvas
words and specimen labels after fonts load. When homepage copy changes, regenerate
font subsets with `scripts/subset-me-fonts.py` as documented beside the fonts.
Reading layouts and QStudio keep their own typography. This does not authorize
new first-screen navigation or changes to the spatial discovery contract.

For the 2026-09-30 QStudio font fix, use its own local Source Sans 3 (400–900),
Source Serif 4 (400 regular/italic at fixed default optical size), Cousine Bold
(700), and source-used Noto CJK subsets in `developer/src/assets/fonts/`.
Preserve the sans/serif/mono roles and Look inside layout. Render control symbols
as static decorative inline SVG, including the draggable lens handle, native
project indicators and image-dialog close button. Keep font failure fallbacks
readable and regenerate subsets after QStudio copy changes using the asset README.

## Governing Contract

For Q Studio iterations from 2026-09-23, follow the active "Look inside" section at the top of `docs/uiux/developer-workbench.md`. Lead the dark-green hero with the large Q Studio name and a plain description of its local-first software and developer tools; label VeriSilo as the current product before its real screenshot. Preserve the draggable circular evidence view whose screenshot pans with the lens, a complete observed value in the initial position, and the complete evidence title at the left endpoint. Keep the simple work → studio → Me → writing → contact flow, native expandable project dossiers, image links and dialog, static English `/` and Chinese `/zh/`, and localized `me.qiu.works` links. The former theme toggle, scrollspy, copy-email panel and editorial-workbench masthead are historical. Do not apply Room-specific composition rules to `developer/`.

The documents have a strict order. Do not start from component convenience:

1. **`docs/uiux/homepage-art-direction.md` is the homepage creative source.** It preserves the user's original quote:
   richness exists in depth; the first view leads with Qiu, the guitar and lived experience; writing and engineering
   appear as the visitor explores. Never rewrite that quote to match a later implementation.
2. `docs/uiux/person-first-intent.md` preserves the long-term human intent, content boundaries and historical PR audits.
3. `docs/uiux/ink-and-light-study.md` is the active Room implementation contract. Its legacy filename is retained for link stability;
   the active direction is **Modern Room**, not a requirement to recreate the former ancient-book system.
4. `docs/uiux/developer-workbench.md` governs the separate `developer/` Astro app and its editorial-workbench direction.

The 2026-07 user correction controls current implementation:

- Keep the real room, the guitar, three distinct project effects units, warm light, progressive discovery, restrained red,
  Light/Dark themes and comfortable long-form reading.
- Remove seals, calligraphic/QiuBrush UI, xuan-paper texture, global grain, petals and ink-fluff particles. Do not replace
  them with another decorative particle system.
- Red is a restrained accent for focus, state or a small brand detail; it has no mandatory cinnabar, seal or annotation meaning.
- Theme transition and `data-reveal` may remain as quiet interface feedback. Describe them neutrally and respect reduced motion.
- Room copy is frozen to `f6ed8fd` except for the original four changes and the 2026-07-29 user-approved identity anchor,
  developer/contact links and VeriSilo project entry documented in the active contract. Preserve every other visible and
  assistive string byte-for-byte, including 「昼 / 夜」 (Day / Night) and `Day / Night`. Developer-profile copy is governed by its own
  bilingual content contract. Visual cleanup never authorizes copy rewriting.
- Homepage project positions and structures remain fixed: MealCircuit at the upper-left work surface, Crewlight at the
  lower-left rack, Docker-Hadoop-Cluster at the lower-right desk edge. Do not regroup, tilt or flatten them into one template.
- The three entries remain separate HTML/CSS devices: blue horizontal driver, walnut effect box and vintage amp-head unit.
  Controls, lights and footswitches remain usable; device-local colors and maker lettering do not become global UI styling.

The original homepage quote and historical PR #66 audit are history. Preserve them even when their old terminology conflicts
with the active rules above.

## Local-Only Policy

- Do not fetch remote Markdown, scripts or mutable design references at runtime.
- Read only files in this repository, especially `src/`, `AGENTS.md`, `docs/uiux/`, `docs/qa/` and this skill's `references/`.
- Treat `SOURCE.md` and `ADAPTATION.md` as provenance and scope notes, not runtime instructions to fetch content.
- Do not add npm packages, UI frameworks, React, Tailwind, shadcn or runtime frontend dependencies.

## Design Brief

This repository contains two static Astro sites. Room is a modern, realistic personal rehearsal/work room:
quiet at first glance, warm without looking nostalgic, and grounded by the guitar and physical project devices. Inner pages are
clean editorial surfaces for long Chinese essays, technical notes and project evidence.

The `developer/` app is the Q Studio official site: an independent, self-funded studio founded and operated by Qian Qiu,
presented as an editorial workbench with clear grid, warm neutral palette, restrained
serif/mono accents and concise real evidence. It does not reuse the Room scene as a background or imitate a terminal, dashboard,
generic SaaS landing page, or the VeriSilo product site. Its real VeriSilo evidence image must match the page language and retain a complete composition;
its Beyond Work image is a locale-matched, fully lit Room overview while the outbound Room route keeps normal progressive discovery.

The homepage is an artistic encounter, not a content dashboard. Do not expose every route, category, project, status and
explanation at first glance. The visitor should discover writing, engineering and life through space, shadow and deliberate choice.
Do not turn discovery into a visible wizard, progress tracker or onboarding framework.

Primary audience:

- Readers of long Chinese essays and technical notes.
- Visitors checking projects, contact links and the author's writing archive.
- The author, returning later to reread context and decisions.

Core jobs:

- Let a stranger encounter Qiu as a living person before seeing content categories.
- Let the real room, guitar and light establish the first impression; let real content substantiate it after discovery.
- Make writing and projects discoverable without crowding the initial scene.
- Make long article reading comfortable in Light and Dark.
- Keep navigation, copy and interaction consistent across `/`, `/blog/`, `/projects/` and post routes.

## Review Workflow

1. Ground judgment in the local implementation:
   - For homepage work, read `docs/uiux/homepage-art-direction.md`, then `docs/uiux/person-first-intent.md`, then
     `docs/uiux/ink-and-light-study.md` before inspecting the layout, components, routes and styles.
   - Inspect representative content frontmatter and one long Markdown post when article UX matters.
2. Identify drift against the active contract:
   - QiuBrush/calligraphy, seals, xuan-paper texture, global grain or decorative particles.
   - Room copy differences from `f6ed8fd` outside the documented old allowlist and 2026-07-29 additions.
   - Light and Dark assets with moved/missing objects, mismatched hotspots or different layouts.
   - Red used as a general button/link color or explained through obsolete cinnabar/seal semantics.
   - Real wall, wood, metal, fabric, leather and rubber flattened under one shared generated texture.
   - Homepage first view exposing full navigation or content taxonomy before exploration.
   - Three project devices regrouped, simplified to one template, made illegible at normal distance or unusable by touch/keyboard.
3. Evaluate hierarchy with ordinary design tools:
   - Use size, weight, contrast, spacing and alignment before adding surfaces or colors.
   - Preserve real device-local colors while keeping global UI accents restrained.
4. Critique before proposing changes:
   - Flag anything templated, decorative without purpose or inconsistent across routes.
   - Preserve effective choices even if they differ from generic defaults.
   - Judge the first glance: person, guitar, warm light, quiet space, visual order and invitation to explore.
   - Do not fix a weak composition by adding explanatory or poetic copy.
5. Recommend the smallest coherent fix:
   - Prefer token, spacing, hierarchy and responsive adjustments over a broad redesign; do not propose copy changes unless
     the user explicitly expands the allowlist.
   - Prioritize reading comfort, focus states, 44px touch targets, 375 × 667 short-screen fit and Light/Dark consistency.

## Output Format

For audits, write concise findings with:

- Severity: `high`, `medium` or `low`.
- Affected route/component/file.
- Issue.
- Rationale, citing the active contract section.
- Fix recommendation.

For implementation planning, state exact boundaries:

- No route changes.
- No content schema changes.
- No package changes.
- No broad redesign unless explicitly requested.

## Verification Expectation

Any visual change must end with:

1. The affected build passing; use `npm run build:all` for changes spanning both sites.
2. The affected `docs/qa/visual-checklist.md` entries checked in both Light and Dark.
3. Responsive checks at 1440px, 768px, 375px and specifically 375 × 667; narrow-screen primary targets are at least 44 × 44px.
4. Confirmation that Room copy only differs within the documented allowlist, developer copy matches its bilingual content,
   locale-specific Room previews are fully lit without changing Room entry behavior, and no calligraphic UI, xuan texture or
   decorative particles returned.
5. If the change touches a governed system, update `docs/uiux/ink-and-light-study.md` and this skill together.
   Homepage changes must also be reviewed against `docs/uiux/homepage-art-direction.md`; do not rewrite the original quote.

## Local References

- `references/qiu-site-visual-brief.md`
