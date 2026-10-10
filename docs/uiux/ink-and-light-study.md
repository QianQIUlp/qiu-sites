# 现代房间 · Modern Room

## 2026-09-30 · Homepage font and glyph consistency

- UI arrows, zoom, reset, play, record and other control glyphs on `/` and `/en/` use inline SVG, keeping the original direction, copy and state without depending on system glyphs.
- The homepage self-hosts pinned versions of Arimo, Gelasio, Cousine, Noto Sans SC and Noto Serif SC, continuing the ordinary sans / serif / mono font roles. Reading pages and QStudio are outside this font change.
- 「千秋」 (Qianqiu), the canvas 「确定」 ("certain") and 「空」 ("empty") use the same small Noto Sans SC 900 subset, keeping the Chinese name, solid/outline styles, the real guitar and the spatial composition. After fonts load, the canvas glyph cache and project nameplates refresh.
- WOFF2 subsets contain only characters used by homepage source, preload the fonts essential to the first screen, use `font-display: swap` and keep a failure fallback. After adding homepage copy, run the font regeneration script; sources, OFL licensing and method are in `src/assets/me/fonts/README.md`.
- Existing navigation and progressive discovery are kept; this change only fixes cross-environment fonts and missing glyphs and adds no first-screen content directory.

## 2026-09-29 · Nine-grid and loading optimization implemented

The user reviewed and asked for the current `me-current.html` prototype to be implemented into source, extending the already-approved original style under the principle 「表达真切，构思大胆，细节可信」 ("sincere expression, bold concepts, credible details"). This section overrides the old four-space convention below; other unaffected parts remain in force.

- Nine-grid: 未走之路 ("The Road Not Taken") / 留一笔 ("Leave a Stroke") / 盲点 ("Blind Spot"); 散页 ("Loose Pages") / 中央 ("Center") / 琴弦 ("Strings"); 另一面 ("The Other Side") / 不赶时间 ("No Rush") / 拆开看看 ("Take It Apart"). Visitors still meet Qianqiu and the guitar first, then discover the depths through the map, wandering, entries and keyboard.
- New areas use articles and real projects as material: a continuous Möbius paper strip, urgings that can be put down, paths sharing endpoints, and 「确定」 ("certain") revealing a gap after rotation. Original article links are kept; English provides matching content and an explanation of the Chinese character form.
- The four projects are presented as finely crafted dark sculptures with cross-sections of light, each with its own form and real origin, approach and boundaries. The abandoned three-layer webpage-screenshot paper slips do not enter the production implementation.
- On first entry and each time a project is selected, it auto-plays a full showcase once; play, pause, resume, replay and manual takeover should all work. Leaving or backgrounding pauses it, so a hidden demo does not consume continuous rendering.
- The first screen first shows a lossless guitar image of the same model, handing over once 3D is ready. Full-precision textures, photographed details and geometry are kept; waiting is shortened with a Worker, per-material draw merging, code splitting and stopping rendering off-screen.
- Chinese and English are fully wired into `/` and `/en/`; homepage assets are bundled by Astro/Vite with no dependency on the prototype directory. Existing reading paths, themes, SEO, audio boundaries and the no-JS reading entry are kept.
- After source and necessary acceptance are complete this round, it goes back for review; local implementation does not imply deployment or an early PR.

## 2026-09-22 · Approved me.qiu.works prototype landed

This section is the base contract for the root-site homepage `/` and `/en/`; combined with the latest addenda above, it takes precedence over the old room's homepage composition, copy freeze and theme requirements below. The text below is kept as history; the existing content of articles, the project archive and long-form pages, and their Light/Dark reading experience, remain in force.

- The homepage follows the user-approved spatial prototype: warm-gray negative space, a huge Chinese 「千秋」, a real wine-red guitar; English also keeps the Chinese name, with "Qiu, between notes." and "Stay awhile." as light accompaniment.
- No AI room background, scrolling personal résumé or project card wall. The main site `qiu.works` handles QStudio; the personal site's target domain is `me.qiu.works`.
- Four destinations are explored through dragging, zoom, the map and keyboard: 中央 ("Center"), 散页 ("Loose Pages"), 琴弦 ("Strings"), 留一笔 ("Leave a Stroke"). The homepage has a fixed light background and the guitar close-up a dark one; neither inherits the reading pages' theme switch.
- Keep the user-approved BanG Dream! POTBELLY FM Rāna model, the SH-1n and reverse-zebra SH-16, the photographed wear, the entry mouse-following and the separate close-up. The unseen back is still an approximate reconstruction and is not claimed to be a full scan.
- The music area's gold overdrive, blue overdrive and echo are three genuinely tweakable pedals, distinct from the historical project-entry devices. Plucking, chords, tone, nine knobs, the 6-second loop and overdub are kept; the tone is a Web Audio synthesis and inspired implementation, not claimed as a precise hardware emulation.
- Muted on first entry; audio is enabled after the user actively makes sound. Background pause, the reduced-motion preference, keyboard operation and the WebGL photo fallback must be kept.
- Chinese/English share Astro components and interaction modules. Switching language keeps the spatial position; a full-page navigation clears temporary recordings and lines. Original-article links in the loose pages keep pointing to Chinese; archive navigation goes to the list in the matching language.
- Source, asset provenance and deployment boundaries are in [`../me-home.md`](../me-home.md). Only the root site is wired; QStudio's implementation in `developer/` is not changed.

This is the site's current visual implementation contract. The filename keeps its old path so existing links don't break; "墨光书房" ("ink-and-light study") is no longer an active visual system to replicate.
Before changing the homepage, read [`homepage-art-direction.md`](./homepage-art-direction.md) first, then
[`person-first-intent.md`](./person-first-intent.md). This file is responsible for implementation consistency and does not replace the user's original quote or intuitive compositional judgment.

## 2026-07 user correction

The current direction is a **modern, realistic, person-first personal room**. At first glance you meet Qianqiu, the guitar and the breath of life; writing and engineering
continue to be discovered gradually through light, shadow and space. Warm light, restrained red, the three project pedals/amp heads, the Light/Dark themes and long-form readability are kept.

Visual decoration such as calligraphy/QiuBrush, seals, xuan-paper texture, global grain, petals and ink fluff is removed from the active interface. Transitions and reveals
may stay, but are described as ordinary interface feedback, no longer packaged as traditional-medium rituals.

**Copy allowlist**: remove 「展开卷宗」 ("open the dossier") and its English counterpart; change the blog counts 「卷 / 题」 ("volumes / topics") to 「篇 / 标签」 ("articles / tags"); remove 「题跋」 ("colophon");
remove the visible 「授权协议 · 文末记」 ("License · end note") block. Beyond these, homepage, shared interface, article and project copy is kept verbatim with `f6ed8fd` as the baseline.
Visual correction, readability improvements or "removing the antique style" must never be interpreted as authorization for broad copy rewrites.

## 2026-07-29 dual-homepage implementation addendum

Room's official domain is `https://room.qiu.works`; the developer homepage is at `https://qiu.works`, with its own contract in
[`developer-workbench.md`](./developer-workbench.md). Room's modern room composition, guitar, shaded exploration, three devices and
Light/Dark themes are not rearranged because of the domain and site division of labor.

Beyond the four allowlist items above, the user approved the following Room changes item by item:

- the first screen adds a lightweight identity anchor, using the approved Chinese and English name and self-description;
- the life close-up and footer add developer homepage and Contact links;
- project data adds VeriSilo, with anchors generated from a stable project key; the homepage still shows only the existing three devices;
- the Chinese and English share cards switch to the real room and guitar, and site metadata uniformly uses `room.qiu.works`.

This is a limited addition, not a new license for free rewriting. Apart from the original four items and the content listed in this section, visible and assistive copy still uses `f6ed8fd` as its baseline.

## Design principles

1. **Person first** — the homepage first answers "who is here", then lets visitors discover the writing, engineering and life entries on their own.
2. **Real space** — the room, guitar, wall, wood, metal, fabric, leather and rubber each keep their real material and contact relationships;
   photos are not covered with paper texture, uniform grain or generated noise.
3. **Quiet hierarchy** — organize information with font size, weight, contrast, whitespace and necessary separators, avoiding cards within cards, decorative labels and extra backing panels.
4. **Restrained color** — red is a sparing site-wide accent, not an antique symbol, and it does not monopolize status meaning; the devices' own blue, gold, wood and light colors
   belong locally to real objects and do not spread into ordinary interface colors.
5. **Reading first** — inner pages may be flatter than the homepage; body width, line height, code, tables, TOC and mobile experience take precedence over the visual theme.

## Theme system: Light / Dark

- `html[data-theme="dark"]` is **Dark**; without the attribute the default is **Light**; the choice is stored in `localStorage.theme`.
- Both themes use the same composition, objects, hotspots and information hierarchy. Paired photo assets may only change time, lamp state, exposure and
  the matching shadows; elements may not disappear, move, float or change contact relationships.
- The homepage continues to use strictly registered day/night room photos. Light stays a low-noise natural daytime room, Dark a night room under a warm lamp;
  do not overlay xuan paper, paper light pools or a separate set of light floating controls for Light.
- Inner pages keep comfortable contrast in both states and do not distinguish themes by material noise.
- **Light / Dark** are neutral theme names for docs and QA; the user-facing button keeps showing the existing 「昼 / 夜」 (Day / Night) and
  「Day / Night」, and is not renamed on its own because of the visual correction.

### Theme transition

Theme switching may keep the existing circular wipe, brief blur or fade, but it is only state-change feedback:

- the animation is short and stable, does not cover content and does not change page structure;
- no leftover overlay after rapid clicks;
- instant switch under `prefers-reduced-motion: reduce`;
- docs and interface do not name it ink bleed, ink splash or any other traditional-medium effect.

## Color and surfaces

- The site-wide base hierarchy uses neutral background, body text, secondary text, border and separator tokens. Old CSS token names may stay during migration,
  but they no longer need to be explained by "焦浓重淡清" (the five ink tones: scorched, thick, heavy, light, clear), and internal token names are not shown to users.
- Red stays as a restrained accent, usable for current state, focus, a few key prompts or brand details. Large buttons, long passages,
  ordinary body links and error messages must not all be dyed red.
- Red is no longer bound to seal, signature, volume title, colophon or annotation meanings; if `--cinnabar` stays temporarily, treat it only as a compatibility variable.
- Pages avoid multiple layers of opaque backing panels. When grouping is needed, prefer whitespace, hairlines, indentation and slight contrast differences.
- Shadows follow the room's main light and physical contact; do not add mutually contradictory floating shadows to every card.

## Fonts and copy

- Headings use a clear regular serif or sans, body and UI use highly readable system fonts, and code and technical metadata may use monospace.
- QiuBrush, Long Cang and other calligraphy fonts no longer appear in the visible interface, and no font subset or character allowlist needs to be maintained for them.
- The homepage name, navigation, component titles and TOC use regular fonts; a font replacement must not rewrite their text along the way.
- Visible copy strictly follows the allowlist above and the 2026-07-29 item-by-item approval; other existing text is not adjusted for being "more direct", "more modern" or
  "easier to understand".

## Reveal and decoration layers

- The existing `data-reveal` may continue to be used for slight in-viewport fade/shift, but body text and key first-screen information must be readable immediately.
- No stacking of multiple entrance animations on one route; under `prefers-reduced-motion`, disable shifts, smooth scrolling and non-essential fades.
- The site uses no petals, ink fluff, floating dust or other purely decorative particles. After removing particles, do not replace them with another decorative animation.
- Photo edges may use ordinary gradients or mask blending as the layout needs, but must not fake xuan paper, ink splash or antique-painting edges.

## Homepage room

The homepage's creative direction remains "东西很多，初见很少" ("many things, little at first sight") as preserved in [`homepage-art-direction.md`](./homepage-art-direction.md).
First glance keeps the name/short introduction, the guitar and a little breath of life; full navigation, desk, workbench and content counts recede into shadow first.

The portrait narrow-screen homepage (width up to 600px) keeps the name, a one-line greeting, the unconditionally initialized real 3D guitar, one primary entry and a short guitar-viewing hint. It hides the subtitle, bottom explanation, duplicate operation hints and manual zoom/overview helper controls; side scene entries, the room map and the motion toggle remain available, and drag/pinch continue to handle wandering and zoom. Desktop and landscape composition are unchanged. This is progressive disclosure, not removal of other scenes or content.

On desktop, two shaded areas for articles and projects continue to control progressive discovery; life/guitar adds no third completion state.
After lingering, keyboard focus or entering a close-up, the target area brightens gently; the current session may accumulate and keep visited areas.
This discovery shows no step bar, completion percentage, tutorial panel or prominent onboarding copy.

Narrative structure: first meeting with the person and guitar → entries in shadow are discovered → writing/projects/life close-ups → return to the room.
All existing names stay unchanged, with only the four allowlist items as exceptions; transitions do not use traditional scroll-painting or ink-splash metaphors.

- Horizontal flipping of the scene image, the copy column and hotspot coordinates must stay in sync; overview and close-ups keep the same room and object continuity.
- Computer content must land inside the real monitor; project content must land on the real desk or device support plane, never floating or passing through furniture.
- Light/Dark overview, writing and projects assets are strictly registered; theme changes do not change hotspot positions.
- Room materials are accepted at low-ISO photorealistic quality: snow-white matte wall, wood, metal, fabric, leather and rubber each distinct,
  not sharing paper texture, grain or generated noise.
- On mobile the three entries are stable and usable on first load, without requiring entering one area and returning first.

### Three project devices

The three projects stay strictly in the author's annotated positions: MealCircuit on the upper-left desktop, Crewlight on the lower-left rack,
Hadoop Lab at the lower-right desk edge. They are three independent HTML/CSS devices and must not be simplified into a recolored template, tilted cards or a full-width HUD.

- **Docker-Hadoop**: horizontal Blue Driver structure, blue two-tier enclosure, top signal strip, vertical gold knobs and a large black footswitch.
- **MealCircuit**: dark walnut box, three solid-wood knobs in a left column, a modern maker-style device nameplate in the middle, a status light and metal colored studs.
  If the marker lettering is kept, it belongs only to this device's Latin product wordmark and does not extend into a site calligraphy system.
- **Crewlight**: vintage amp-head device with restrained leather piping, a cream six-knob panel, a cyan power light, a low-contrast honeycomb grille and its own colored studs;
  the control panel takes about the top third and the grille at least 60%.

Project names, control labels, status and entries are accepted at normal full-scene viewing distance at 1440px, not substituted by zoomed crops: project names no smaller than about 24px,
control labels no smaller than about 11px, secondary status no smaller than about 9px. Knobs support pointer and keyboard adjustment, lights toggle, and the footswitch enters the correct project;
the device language does not spread to ordinary navigation and buttons.

The narrow-screen project list keeps a slight staggered width of about 90%/95%/96% with left-right rhythm, spacing about `clamp(20px, 5.5vw, 26px)`.
On a **375 × 667** short screen there must still be natural whitespace; titles, status, controls and entries do not overlap or get cut off by bottom controls,
primary interaction areas are at least 44 × 44px, and the page has no horizontal scrolling.

## Inner pages and long-form

- Blog, article and project pages use a modern editorial layout: clear title, summary, metadata, body and source relationships, without forcing double-line classical-book ruling, scrolls or paper backing panels.
- Small page labels keep existing copy; the blog counts only change 「卷 / 题」 to 「篇 / 标签」.
- Introductions, boundary notes and project remarks keep their original content and structure; only the 「题跋」 label is removed.
- The license data in article frontmatter is kept, but the visible 「授权协议 · 文末记」 block is not rendered.
- All articles automatically get a TOC; without level-2 to level-4 headings, provide at least 「文章开头」 ("Start of article"). The TOC uses regular fonts, and expanding/collapsing does not squeeze the body.
- Body keeps comfortable line length, font size and line height; long code blocks and tables scroll within their own containers without creating page-level horizontal scrolling.
- Images keep true color, correct proportions and useful alt text; no overlaid xuan-paper texture, global noise or hard-edged decorative frames.

## Accessibility and responsiveness

- Both Light and Dark must meet readable contrast for text, links, focus, code and controls.
- Keyboard order follows visual order; all interactive elements have a clear `:focus-visible`; navigation uses links and state actions use buttons.
- On narrow screens, primary navigation, the theme toggle, project knobs/lights/footswitches and back controls are at least 44 × 44px.
- Must test 1440px, 768px, 375px and the 375 × 667 short screen; no page-level horizontal scrolling, overlap or unreachable content.
- With JavaScript off, real articles, projects and back links remain accessible; with reduced motion, content reveal does not depend on animation.

## Do / Don't

**Do**

- First step back and look at the homepage's light and dark, person focus and whitespace, then check component details.
- Use real room materials, regular fonts, existing copy, restrained red and stable Light/Dark paired assets.
- Prioritize fixing reading, focus, touch and short-screen layout before adding visual details.
- After changes, run `npm run build` and verify both themes per `docs/qa/visual-checklist.md`.

**Don't**

- Don't use calligraphy/QiuBrush, seals, xuan-paper texture, petals, ink fluff or replacement particles; don't expand visual cleanup into a copy rewrite.
- Don't flood ordinary buttons, links and long content with red, or force cinnabar/signature meaning onto red.
- Don't nest cards in cards, or flatten different materials into one surface with global noise.
- Don't change the structure or author-annotated positions of the three project devices, or spread the device language into site-wide UI.
- Don't turn the homepage into a content overview, personality checklist or step-by-step tutorial.
- Don't add runtime dependencies to solve static CSS problems.

## Change guard

Before committing any visible change:

1. `npm run build` passes.
2. Check Light and Dark, and 1440px, 768px, 375px and 375 × 667, per `docs/qa/visual-checklist.md`.
3. For homepage changes, cross-check `homepage-art-direction.md` and `person-first-intent.md`.
4. When touching color, fonts, themes, transitions, the room, project devices or the long-form system, update this file and
   `.agents/skills/qiu-site-frontend-design/` together, without rewriting historical quotes or historical PR audits.
5. Compare final visible text with `f6ed8fd`; only the four old allowlist items and the identity, link and VeriSilo differences approved item by item on 2026-07-29 are allowed.
