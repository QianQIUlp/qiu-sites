# Visual QA Checklist

## me.qiu.works homepage (2026-09-29 nine-grid)

The homepage `/` and `/en/` use the approved fixed light space and dark guitar close-up; the old homepage's day/night background and three project-entry checks below do not apply. Inner pages still check their existing Light/Dark reading experience.

- Root-site build passes; the shared Chinese/English homepage can reach all nine spaces on desktop, tablet and the 375 × 667 small screen.
- 「千秋」 (Qianqiu) is kept in both languages; switching language keeps the scene hash, and article and project list links point to this site.
- Homepage self-hosted fonts load successfully; Chinese and English arrows and play/record/mute/reset states are all SVG, and icons do not enter accessible names. Check that the 「确定」 ("certain") canvas and project nameplates refresh after fonts load, and that a readable fallback remains when font requests fail.
- The entry first shows a guitar preview of the same model and hands over seamlessly after the first 3D frame; close-up, detail switching and return work; textures, previews and the Worker load from build output, with no prototype paths.
- The work area auto-demos on first entry and when any project is selected; pause, resume, replay, manual takeover and pause-on-leave work; the 3D showcase loads on demand and stops drawing off-screen.
- Released while moving, the room coasts about a room and settles; a stopped drag, pinch, map click and arrows never coast. Loose pages lift, turn by the held point (never past ±30°), glide and land; a hard toss carries one into the next room, where it can be picked up, and "Put the pages back" flies it home. Held in the window patch, each page glows and shows its mirrored back and pencil draft without the draft touching the printed text, in Chinese, English and on phones; motion off disables coasting and throwing but keeps the light.
- Quiet tutorial (clear `localStorage` `me-found` first): on a first visit the home room drifts a breath and settles back once; in Loose pages a page under the mouse rises slightly, the page nearest the window stirs into the light after a moment, then 「举起来，对着光看看」 writes itself in above page 01 without overlapping any page (desktop and phone) and rubs out once a page has been held in the light. Touching anything delays the demonstration; nothing replays after it has been learnt.
- Every room's lesson (clear `me-found`, enter each room and stay still ~3 s): strings shiver silently; a graphite line draws and hums in 留一笔, then your own line shivers once after you draw; the ribbon, threads and 「确定」 move a little by themselves and settle; the work note follows the tour; after dusk a slip drifts toward the hollow. Each note sits beside its object at desktop and phone width (chalk-light on the dark jam room), and rubs out after doing the thing. Mouse over the ribbon, threads and word: a slight lean, back on leave.
- 留一笔: short lines sound higher than long ones and light their note on the ruler (labels clear of the footer, sparse at phone width); a fresh pluck bends at the touch point; a closed loop rings with ripples; plucking a line makes the lines it crosses answer with glowing knots. Lessons: the pencil closes a ring by itself, then 「首尾连上，听听看」; with two lines, 「让两根线交叉试试」.
- 另一面: the red dot follows a drag along the middle line without jumping where the strip overlaps; past one lap the line shows faintly through where it runs behind; at 720° the dot is a pair of scissors, and clicking them cuts and opens the strip into one loop that fits the stage at desktop and phone width, with the cut caption and 「粘回去」 restoring it. Both notes follow the dot after turning the ribbon.
- 盲点: a mouse brushed across 「确定」 swings its slices like blinds, a tap ripples outward, both settle; the eye card's cross and dot sit level and well apart, the card turns over to readable text in both languages and clears the slider and caption on phones.
- 未走之路: brushed threads glow and settle; a clicked thread becomes the red route and the listening follows it; the status names the way; choosing it again or a route button restores the default.
- Loose pages on phones: 01 and 02 side by side, 03 below, every line readable at rest, 「把纸放回去」 clear of the motion pill.
- Paper stock, ZH and EN, front and back, desktop and phone: 01 characters sit one per grid cell with red circles under the last line, the date stamp on the back; 02 typed lines sit on the card's rules, the struck phrase is x'd over, the punch hole shows the desk; 03 grid shows faintly through, answer boxed. Held to the light, drafts and mirrored backs still read over each stock.
- 不赶时间 ("No hurry"): still for ~1.5 s, the clock, window patch, leaf shadows and dust start moving; any pointer movement holds them at once. Within ~35 s of stillness the lamp clicks on and 「灯亮了。」 + the evening line appear in its light, legible in Chinese, English and at phone width (two lines, clear of the footer); the clock note rubs out. Motion off: arriving is already dusk. Leaving at dusk, home (including the guitar), papers (patch still usable) and every other room stay in evening light; the jam room keeps its own dark. A released slip balls up, arcs into the hollow and disappears.
- The new areas' paper strip, put down/restore paper slips, path playing and offset text are operable; English titles, status, ARIA and source links are complete, and mobile captions and controls do not overlap.
- Music area strings, tone, knobs, switches and loop state are operable, and sound only plays after active interaction; the prototype's verified audio algorithm is kept.
- The pedalboard reads left to right (Centaur → Blues Driver → Harmonist → After Hours); every knob turns by dragging around it and by keyboard, every stomp presses, clicks and lights its LED, the Harmonist's KEY/SHIFT detents click, and pushing a pedal's output reaches the VU red zone and PEAK lamp. On phones the presets stay on one line and readable over the strings photo, a swipe or tab moves exactly one pedal into the centre, and the room never scrolls sideways.
- All scenes are reachable via map/keyboard; reduced-motion and no-WebGL fallbacks are kept. With JS disabled, the reading archive is still reachable.
- canonical, language alternates, robots and sitemap use me.qiu.works; the homepage share image matches the new composition.
- QStudio is not changed; external domain binding and old-domain redirects must be configured separately at release.

Use this checklist before merging visible site changes. Test the built site when possible:

```sh
npm run build
npm run preview
```

Core viewports:

- Desktop: 1440px or wider
- Tablet: 768px
- Mobile: 375px
- Short mobile: 375 × 667px

Always check **Light** and **Dark** mode for changed routes.

## Modern Room Design System

When a change touches color, fonts, motion or the room scene, go through this section item by item in addition to the route entries below
(homepage creative origin: `docs/uiux/homepage-art-direction.md`; implementation contract: `docs/uiux/ink-and-light-study.md`):

- Both themes share one composition: between Light and Dark photo assets no element disappears, moves, floats, interpenetrates or changes layout;
  only time, lamp state, exposure and the matching shadows change; switching never exposes the other theme or the base color.
- Headings, body, secondary info and separators form a clear hierarchy through font size, weight, contrast and whitespace, not by stacking new backing panels or decorative labels.
- Red is only a sparing accent; ordinary buttons, links and long text are not dyed red wholesale, and no cinnabar, seal or annotation meaning is attached.
- The room's main light, object contact shadows and UI shadows share one direction, with no contradictory floating effects.
- The homepage name, component titles, navigation, TOC and body all use normal readable fonts; the visible interface has no QiuBrush, calligraphy or seals.
- Copy matches `f6ed8fd`, with exceptions only for the existing four-item allowlist and the identity anchor, developer/contact entries and VeriSilo archive explicitly approved on 2026-07-29;
  the generated 「题跋」 ("colophon") is removed; the visible 「授权协议 · 文末记」 ("License · end note") block is removed. The theme button is still 「昼 / 夜」 (Day / Night) and `Day / Night`.
- If `data-reveal` is kept, it only does a slight, brief fade/shift; the first screen and body never wait for animation to be readable.
- The theme transition is short and stable, with no leftover overlay after rapid clicks; copy and implementation notes do not package it as a traditional-medium effect;
  it switches instantly under `prefers-reduced-motion`.
- DOM and screenshots contain no petals, ink fluff, floating dust or replacement purely decorative particles.
- Scene images blend into the layout with ordinary gradients/masks, with no xuan-paper, ink-splash or antique-painting edge effects.
- Room walls keep the physical feel of snow-white matte paint; wall, wood, metal, fabric, leather and rubber share no grain,
  embossed worm-like squiggles, paper texture or repeated generated noise.

## Homepage

- At first glance only Qianqiu's name/short introduction, the guitar and a little breath of life carry visual focus; full navigation, desk, workbench and content counts do not all jump out at once.
- In both Light and Dark, the initial background is fully covered by the left and right shaded areas for articles and projects, leaving only the personal introduction, the guitar above the shading layer and necessary controls;
  on desktop, lingering/focus slowly fades the whole black curtain belonging to articles or projects, without light bleeding between them, and with no circular spotlight or instant brightening.
- After returning from a close-up or a specific article, all visited areas stay bright cumulatively; after visiting articles and projects in turn the black curtain disappears completely,
  and the accumulated state is kept within the current session across refreshes and returns from articles.
- On first mobile entry, the bottom dock already shows the articles/projects/life entries fully and stably, without needing to enter life and return first.
- Progressive discovery is not turned into a step bar, progress state, explanation panel or prominent onboarding button.
- The Chinese first screen shows 「学生开发者 · 独立构建者」 ("CS student · indie developer"), 「我是千秋。」 ("I am Qianqiu.") and the approved new self-description; the English first screen shows
  `CS student · indie developer`, `I'm Qiu.` and the approved new self-description; other homepage copy stays at the baseline.
- The Developer profile / 开发者主页 and Contact / 联系我 links in the life close-up and footer go to `qiu.works` in the matching language.
- The three homepage devices remain explicitly fixed as MealCircuit, Crewlight and Hadoop Lab; VeriSilo only enters the project archive.
- The homepage has no calligraphy, seals, xuan-paper noise, petals, ink fluff or other decorative particles; text changes only per the four-item allowlist above.
- Header brand, nav, and theme toggle fit without wrapping awkwardly.
- The first viewport reads as Qiu's personal rehearsal room rather than a product landing page or metrics dashboard.
- The room, title, three hotspots, and guitar identity remain legible without layout-breaking overlap at desktop, tablet, and mobile widths.
- The guitar keeps the approved headstock, relic body, pickup layout, stand, fret-marker sequence, and the 11–13 fret `m` marker.
- Initial load keeps the room and guitar at one stable matrix; there is no large-to-small entrance animation or late proportion shift.
- Article and project hotspots keep the visitor on `/`, update only the hash, and finish with real article/project data aligned to the physical monitor or drafting mat.
- At an early, middle, and late transition sample, the room, curtain, guitar, focus plate, and exposure move at different rates without a hard cut or a frozen loading interval.
- Scene rows and “all” links still navigate to the existing article and project routes normally.
- Guitar & Life focuses the guitar and reveals the life note in place; Escape and “回到房间” ("back to the room") restore the overview.
- At 375px the hotspots form a usable bottom dock after discovery, the title stays readable, and no page-level horizontal scroll appears.
- At exactly 375 × 667px, the three project devices retain natural vertical breathing room; no title, status, control,
  footswitch, return control, or bottom dock is clipped or overlapped.
- At 768px portrait, focus content stays fully inside the viewport rather than being cropped with the 16:9 scene.
- Overview and close-ups all generate responsive derivatives from the current 1672 × 941 master; wide screens show no obvious blur, noise or seams from upscaling.
- Light/Dark overview, computer close-up and workbench close-up each use their theme's assets; the computer UI lands inside the monitor; the three projects land strictly in
  the author's annotated upper-left desktop, lower-left rack and lower-right desk edge regions, with no unauthorized regrouping, tilting or full-width HUD.
- The three project entries stay in the author's annotated upper-left, lower-left and lower-right positions, and their structures are distinguishable at a glance: MealCircuit is a dark wooden box with
  three solid-wood knobs in a left column, an enlarged modern maker-style device nameplate in the middle and metal colored studs; Crewlight is an enlarged leather amp head with a cream six-knob panel,
  cyan light, honeycomb grille and colored studs, its cream panel ending at about the top third of the body and the grille taking at least 60%. Project names, knob labels, status and entries
  must be directly legible at normal viewing distance in a full-scene 1440px screenshot, never accepted from a zoomed crop; project names no smaller than about 24px, control labels
  no smaller than about 11px, secondary status no smaller than about 9px;
  Docker-Hadoop is a blue two-tier enclosure with a top signal strip, vertical gold knobs and a large black footswitch, not degraded into a recolored template.
  All knobs adjust by drag/click/arrow keys, lights toggle, footswitches move when pressed and enter the correct project; on narrow screens titles/status/entries
  are not truncated, every primary touch area is at least 44 × 44px, and there is no horizontal scrolling.
- With JavaScript disabled, `#writing-desk`, `#project-workbench`, and `#life-corner` expose their content and the return link works without script.

## Blog Index

- Archive heading and summary counts align cleanly at each viewport.
- Post cards keep date, cover, title, description, tags, and cue readable.
- Covers and fallback media use a consistent aspect ratio.
- Long titles and descriptions wrap without overlapping neighboring columns.
- Card hover, active, and focus states are visible but do not shift layout.

## Article Pages

- Test every post at least once, including long titles, image-heavy posts, posts without a cover image, and a post without section headings.
- Editorial masthead keeps title, description, date, tags, and the un-tinted real cover readable in both themes.
- Fallback article masthead looks intentional when no cover image exists.
- Body measure, font size, line height, headings, blockquotes, lists, tables, and code blocks are comfortable to read.
- Every article exposes the same TOC control at the viewport's left-middle; one click opens it and the next click closes it.
- The drawer overlays without reflowing the article or causing page-level horizontal scroll, and remains usable at 375px.
- TOC links scroll to the correct headings, headings are not hidden behind the sticky header, and the active entry follows reading position.
- A post without section headings still has the fallback entry 「文章开头」 ("Start of article") and that link returns to the article masthead.
- Inline images have useful alt text, preserve aspect ratio, and do not cause visible layout jumps.
- Long code blocks and tables scroll inside their own containers instead of causing page-level horizontal scroll.
- Article `license` frontmatter remains intact, while the visible 「授权协议 · 文末记」 block is not rendered.

## Projects Page

- Hero copy and note remain balanced at desktop, 768px, and 375px.
- VeriSilo is first, uses the stable `#project-verisilo` anchor, and states Public pre-release · v0.1.0-rc4 / 公开预发布 · v0.1.0-rc4 (Chinese label) while naming the installer as unsigned.
- Every featured case uses a stable `project-{key}` anchor rather than its array position.
- Featured project dossiers keep ordinal, title, repo slug, links, summary, case study, boundaries, and tags readable.
- External project links are clearly focusable and tappable.
- Secondary traces and playbook items wrap long titles without overlap.
- Project names, URLs, and positioning match `src/data/projects.ts` and project briefs.

## Developer Profile

- After self-hosted fonts load, Chinese and English body, serif headings and 700-weight mono labels use the pinned glyphs; arrows, the lens handle and the expand and close icons are all static SVG and do not enter accessible names. When fonts 404, text stays readable and there is no new overflow at 320 width.
- `/` and `/zh/` statically output complete content in the matching language; canonical, hreflang and sitemap point to `qiu.works`.
- At first glance the first screen reads 「Q Studio」 and its work 「本地优先的软件产品与开发者工具」 ("local-first software products and developer tools"); VeriSilo is clearly labeled as the current product and browser identity space. The real product-site image and the draggable evidence lens carry this identity without overshadowing the studio name; the initial lens shows the full observation value, and at the far left the evidence title is fully readable.
- Mouse and touch dragging of the round lens, the native slider and keyboard arrow keys all move the evidence; the screenshot inside the lens pans with position and never becomes fixed explanatory text.
- VeriSilo, MealCircuit, Crewlight and Hadoop Lab appear in order; the teaching lab is not written as a product. Native `details` expand by keyboard and keep audience, boundaries and real sources.
- The `Me` anchor goes to the founder section; the 「千秋」 and guitar preview in the matching language is fully visible and links to `me.qiu.works`. Writing links and contact details work.
- Screenshots can be enlarged; Escape or the close button returns to the original link; with JavaScript disabled the image link still opens directly.
- Check the first screen and each section at widths 1440, 768, 375, 375 × 667 and 320, with no page-level horizontal scrolling or occlusion; the reduced-motion setting does not hide content.
- Chinese and English 1200 × 630 OG images use the new first-screen composition; check the images have no old toolbar, cropped title or broken links.

## Light / Dark Themes

- Toggle updates the visible state and persists across reloads.
- Transitions are smooth with no leftover overlay; after switching, the header, hotspots and personal introduction are readable in both states.
- Page background, surfaces, borders, text, links, tags, and code blocks keep adequate contrast.
- Homepage Light and Dark share the stage, personal introduction, hotspots and control materials, switching only the strictly registered day/night background images;
  the Light homepage has no xuan-paper texture, separate light floating layer or another set of foreground filters.
- Images and cover scrims do not make white text unreadable.
- Native browser color scheme follows the active theme.
- Directional surface and note shadows remain visible without turning into bright halos or crushed black blocks.

## Motion And Progressive Enhancement

- Homepage camera transitions complete once, do not trap focus, and settle into the selected in-room state in about 2.4 seconds.
- With `prefers-reduced-motion: reduce`, the selected in-room state and its content appear immediately without camera displacement, fading, progress motion, or smooth scrolling.
- Below-the-fold reveal items may use one restrained slight rise/fade, with no more than three stagger steps.
- Hero copy and article body are readable immediately and never wait for scroll animation.
- With `prefers-reduced-motion: reduce`, reveal transitions, hover translation, and theme transitions are disabled or instant.
- With JavaScript disabled, every `data-reveal` element remains visible and usable.

## Mobile Widths

- No page-level horizontal scrolling at 768px, 375px, or 375 × 667px.
- Sticky header does not cover content or anchor targets.
- Tap targets are comfortable, especially nav, theme toggle, cards, project links, and contact links.
- Main navigation, theme controls, return controls, project controls and footswitch links provide at least a 44 × 44px interaction area on narrow screens.
- Text stays inside buttons, pills, cards, and article containers.
- Multi-column layouts collapse without awkward gaps or clipped content.
- At 375 × 667px, content remains reachable without relying on overflow hidden or overlap beneath fixed controls.

## Keyboard And Focus

- First Tab reveals the skip link and Enter moves focus to main content.
- Tab order follows the visual reading order through nav, theme toggle, content links, and footer links.
- Every interactive element has a visible `:focus-visible` state.
- Theme toggle works with Enter and Space and updates `aria-pressed`.
- Links use anchors for navigation; buttons are used only for actions.

## External Links

- External links open the intended destination.
- Links using `target="_blank"` include `rel="noopener noreferrer"`.
- Source, license, contact, GitHub, Bilibili, and project links are not broken.
- Cross-site Room/Developer links preserve the intended language.
- Internal route links return 200 and keep trailing slash conventions.

## Image And Layout Stability

- Above-the-fold images have stable dimensions and do not visibly shift text after load.
- Below-the-fold images lazy-load without changing reserved layout space.
- Article images, post cards, and featured media keep consistent aspect ratios.
- Font loading does not create noticeable title, TOC, or hero shifts.
- Run one slow-refresh pass on mobile width to catch late shifts after fonts and images load.
