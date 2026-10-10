# 现代房间 · Modern Room

## 2026-10-10 · No hurry, and a quiet tutorial (open-world step 3, round 2, pending Qiu's review)

Qiu's feedback on round 1: the design was right, but at first it looked ordinary because nothing told them the pages could be dragged; finding that out was the delight. The problem is discoverability: a subtle tutorial level, never instructions up front.

- **A quiet tutorial** (`hints.js`, `hints.css`): rooms teach by showing, then by a pencil note, and stop once the visitor has done the thing (`me-found` in `localStorage`, so returning visitors are left alone).
  - *Objects answer attention*: a loose page under the mouse rises a little (`--lift` .13, longer shadow), so it reads as something you can pick up.
  - *The object demonstrates once per visit* after the visitor has been in the room for a moment without touching anything (any pointer movement, touch, wheel or key restarts the wait). Papers: the page lying nearest the window light stirs, rises into the light so its draft and back show through, and settles (`hint:stir`). Home, first visit only: the room drifts a breath (≈ 3% of a room) toward the pages and settles back, the same coast as a released drag (`hint:nudge`), so the world shows it moves.
  - *Then a pencil note* in Qiu's hand ("Me Hand") writes itself in beside the object, stroke by stroke, with a small arrow: papers 「举起来，对着光看看」 ("hold one up to the light") above page 01 pointing at the window; No hurry 「你不动，它才走。」 ("It only moves when you don't.") beside the clock. Doing the thing (holding a page in the light / reaching dusk) rubs the note out with a brief smudge. Notes are `aria-hidden`: the bar hint and keyboard flows already carry the same information. Motion off: no demonstrations, notes appear without the writing animation.
  - Future rooms add an entry to `lessons` in `hints.js` (dwell, demo event, note, found key) instead of inventing their own onboarding.
  - **Every room teaches** (Qiu, second review: the hints must cover every room, not two). `lessons` holds an ordered list per room; a later lesson waits until the earlier one is found (and until its `when` holds), then starts its own patient wait. Demonstrations change nothing the visitor chose (no value, no thought, no sound); notes sit beside their object and turn their arrow toward it:
    - Home: the room drifts and settles (`hint:nudge`), then 「整间屋子，都能拖着走」 ("grab the room and wander") under 千, arrow to the edge. Found: a pan of 40 px.
    - 琴弦之间 ("A little jam"): the six strings shiver one after another without a sound (`hint:strings`), then, in chalk-light pencil on the dark room, 「点一根弦，再顺着划过去」 ("tap a string, then brush across"). Found: a string played by hand or key.
    - 留一笔 ("Leave a line"): a graphite line draws itself across the empty space and an invisible finger plucks it (`hint:sketch`, `.trace-ghost`), then 「像这样，画一笔」 ("like that. your turn"). Once the visitor has drawn, their own line shivers once (`hint:quiver`) and 「碰碰它，它会响」 ("touch your line. it rings") follows. Found: drawing a line; plucking one.
    - 另一面 ("The other side"): the ribbon turns about 45° by itself and settles (`hint:ribbon`), then 「拖着它，转到背面去」 ("drag it round to the back"). Found: turning it to the next thought.
    - 拆开看看 ("Beneath the surface"): the existing guided tour is the demonstration; after it 「换你来，上下拖」 ("your turn: drag up and down"). Found: moving the section by hand, slider or depth button.
    - 不赶时间: after dusk is found, a draft lifts the slip nearest the hollow toward it and lets it settle (`hint:breeze`), then 「揉掉一个“应该”」 ("crumple up a “should”"). Found: letting a slip go.
    - 未走之路 ("Paths"): the threads part by themselves and close again (`hint:threads`), then 「拨开它，换条路走」 ("part the threads"). Found: bending past 25.
    - 盲点 ("Blind spots"): the word turns about 20° so its gaps flash, then turns back (`hint:glance`), then 「换个角度，再看看」 ("look again, from the side"). Found: a viewpoint of 30° or more.
  - **Objects lean toward a mouse** as their quiet hover answer: the ribbon (±8°), the threads and the blind-spot word (toward the side only) lean a little after the pointer and return when it leaves. Like the demonstrations, the lean is added to what is drawn, never to the value.
- **Paper stock** (Qiu: the pages looked plain, not like real paper; typography should vary in both languages). Each page is now a real kind of paper with its own hand (`paper-stock.css`, `.paper-stock` printing layer; cq units from the page):
  - 01 is Chinese manuscript grid paper (原稿纸): faded vermilion square cells with a blank strip under every row inside a doubled frame, a printed 「12 × 16 = 192」 count, written in blue-black ink in LXGW WenKai ("Me Kai"), one Chinese character per cell, punctuation taking its own cell as on a school essay; the good line carries a teacher's red circles (`text-emphasis: open circle`). English uses the same pen on the rows with a red wavy underline. Back: the grid faintly from behind, the date as a crooked round red stamp.
  - 02 is a red index card through a typewriter: a doubled head rule, ruled lines under each typed baseline, rounded corners and the catalogue punch hole (a mask, so the desk shows through). Chinese is typed in the Song serif (as Chinese typewriters were), English in Courier Prime ("Me Typewriter"); the struck phrase is typed over with x's.
  - 03 is a green engineering computation pad: the grid printed on the back so the front only sees it through the sheet, a header rule with 「DATE · SHEET 3 OF 3」 and a margin line. Chinese is lettered in Zhuque Fangsong ("Me Fangsong", long Fangsong being the Chinese drafting standard, narrowed to .86), English in Architects Daughter capitals ("Me Drafting"); the answer is boxed. Back: the full grid.
  - New faces are subset to the characters between the `paper-font` markers in `Room.astro` (about 85 KB together).
- **不赶时间 ("No hurry"): time only moves when you stop** (`afternoon.js`, `afternoon.css`). After 1.4 s without any pointer movement, touch, key, wheel or scroll in this corner, the afternoon starts to pass, easing in; the slightest movement holds it at once. From mid-afternoon to dusk takes 34 s of stillness (`--hour` 0 → 1, with `--gold` for the low warm sun and `--dusk` for evening, all on `#room`).
  - The window's light on the floor (`.idle-sun`, four skewed panes) slides left and stretches, warms from cream to coral, and slips under the hollow, which swallows it. Dust motes drift up the beam from the patch towards the window, faint while you move and clear once you are still (`.idle-dust` canvas, drawn only while this corner is in view).
  - A plain wall clock reads 15:00 → 18:30; its hands only move while nobody does.
  - At `--hour` .86 a small pendant lamp on a long cord clicks on (a flicker, plus a switch click when sound is on); its warm light sits in the daylight layer (`.day-lamp`) so it shines over the dimmed evening.
  - At dusk the slips' sentence gives way to the evening line, in the lamp's light: preface 「灯亮了。」 ("The lamp is on."), line 「一个下午过去了。<br><em>你什么也没错过。</em>」 ("A whole afternoon went by. / You didn't miss a thing."). Claude chose it for Qiu: the room's essay is about not owing a resource a use, and "you didn't miss a thing" answers the fear of waste directly.
  - Nothing resets and nothing scolds you. With motion off (or reduced motion) arriving here is already dusk.
  - The bar hint reads 「把「应该」放下 · 或者，别动」 ("Let go of a “should” · Or stay still").
- **The hour carries across the house** for the rest of the visit (`sessionStorage` `me-hour`; reading routes keep their own themes). In every room the daylight's sun drops and reddens (`.day-sun`, `.day-ember`), blinds and leaf shadows stretch and fade, and evening settles as a warm rose-to-lavender multiply (`.day-dusk`). The papers' window patch turns to sunset and lengthens but never goes out, so pages can still be held to the light. The home guitar's render follows (`guitar-model.js` `lighting.room()`: the key light lowers and reddens, the bounce cools towards an evening sky, exposure drops slightly). The jam room keeps its own lamp-lit dark.
- **Slips crumple**: a slip let go is balled up (lumpy corner radii plus crease shading; its words fold away), tossed along a short arc, ticks off the rim and drops into the hollow, with a paper-crumple sound when sound is on (`rig.crumple()` in `audio-engine.js`).

## 2026-10-10 · Loose pages and letting go (open-world step 3, round 1, approved by Qiu 2026-10-10)

Step 3 gives each remaining room one idea (proposal approved by Qiu on 2026-10-10; order: letting go + loose pages, no hurry, leave a line, the other side, blind spots). Qiu asked Claude to choose the hidden texts.

- **Letting go keeps the room moving** (`scene.js`): a pan remembers its last 90 ms; released while still moving, the camera carries that speed and bleeds it away (≈ .945 per frame, capped at .006 room/ms), bouncing softly off the world's edges. A flick travels about one room. A drag that stops before release, a pinch, a click on the map, the arrow keys and the wheel never coast. Only when a coast comes to rest within .14 of a room's centre is it drawn the last bit of the way; otherwise it stays exactly where it stopped. Motion off disables coasting.
- **Loose pages are paper** (`papers.js`, `papers.css`): the three pages live in `.paper-layer` (same box as the papers room) instead of inside the room's section, so they can leave it. A held page lifts (scale, longer softer shadow to the lower left) and turns until the point you hold leads the way, limited to ±30° by the desk. Released moving, it glides (air drag, still a little aloft), then lands and slides to a stop with floor friction, plus a small natural turn. Inside its room the edges are soft; faster than .0011 room/ms it slides past into the next room and stays there for the visit, interactive only while you are in that room (`inert` follows the page's own room). The world's walls keep every page whole. "Put the pages back" flies strays home. Click still flips; Enter/Space still flips.
- **The window patch**: `.paper-sun` is the window's light on the floor of the papers room: four warm panes skewed by the low sun, mullions in between, a soft ambient shade around it and the same leaf shadow swaying across. A page lying in it is warmed (`--sunlit`).
- **Held up to the light** (`--glow` = lifted × in the patch): the face glows from the window side, paper fibres and leaf shadows show, the other face's words show through mirrored, and an erased pencil draft appears. Each face is isolated so its blend layers never mix with the desk. Drafts (between the `hand-font` markers in `Room.astro`) come from each essay: 01 「路有很多条，结局只有一个。」 struck, rewritten 「结局只有一个，路有很多条。」, note 「这也算逃避吗？也许吧。」 ("Many roads, one ending" → "One ending, many roads"; "Running away? Maybe."); 02 the original aphorism 「有条件的善意不是善意，是定价。」 struck, rewritten 「一个我以为很贵的信号，被证明很便宜。」, note 「混合态」 ("mixed, mostly"); 03 「我学完 GitHub 了。」 struck, rewritten 「知道该从哪里开始。」, note 「git revert，安全」. The handwriting is "Me Hand" (Long Cang for CJK, Caveat for Latin), subset to exactly these strings. On phones page 03 shows only its struck line and note.
- **Copy**: the room line is 「随手扔开也行。把一张举到窗边的光里看看。」 ("Toss them around. Hold one up to the window light."); the hint reads 「举到光里看看 · 点一下翻面」 ("Hold a page to the light · Click to turn").

## 2026-10-10 · The pedalboard room (open-world step 2, approved by Qiu)

Qiu's feedback: the old pedals were "way too crude"; they love the Centaur, the Blues Driver and a harmony pedal, and getting this room right matters more than anything else on the site. The VU meter stays ("pretty novel") and its red zone should be something you can actually reach. The dark lamp-lit room and the `jam-strings.webp` close-up stay.

- **Four pedals, read left to right like a real board**: guitar → Centaur (gold) → BOSS BD-2 Blues Driver → BOSS PS-6 Harmonist → After Hours tape echo → out. The input cable enters the Centaur on the left, the output leaves the echo on the right, short patch cables loop under each pair, and the signal label reads GUITAR → GOLD → BLUE → HARMONY → ECHO → OUT. Never mirror the order; on phones the board starts at the Centaur and slides left.
- **Drawn as objects, not widgets**: each pedal is an inline SVG face in millimetre-like units (Centaur 94×119, BOSS compacts 73×129, echo 84×119) on a Pedaltrain-style rail board. `--u` is a registered length computed from the deck's container query units, so the whole board scales as one object. Finishes are SVG filters and gradients: brushed gold with an engraved centaur archer, BOSS blue and ice-silver with ribbed rubber plates, CHECK LEDs and thumbscrews, and green hammertone with a tape window whose reels spin while the echo is on. Shared gradients, filters, the screw symbol and the stomp-switch markup live in the hidden `.pedal-defs` SVG in `Pedalboard.astro`; the stomp is inlined (not `<use>`) so CSS can press its cap.
- **Knobs** (`PedalKnob.astro`, kinds `klon` / `boss` / `chicken`): the skirt and pointer turn; the sheen and cast shadow stay still because the lamp does not move. Drag around the shaft and the knob follows the pointer 1:1 across its 270° sweep (no angle is read inside a small dead zone at the centre); a plain vertical drag, the wheel, arrow keys (Shift for fine) and double-click to reset also work. A small value tag appears on hover, focus or drag. Stepped knobs (Harmonist KEY and SHIFT) print one mark per detent and click as they pass each one.
- **Stomps**: pressing sinks the chrome cap (or the whole BOSS plate) and dips the pedal slightly, plays a short mechanical click through the board and vibrates on touch; the LED then lights its lens and spills a glow onto the paint.
- **Harmonist**: a real diatonic harmony. KEY picks a major key (default G, which suits the Open / Em / G / C / D chords); SHIFT picks −1 oct, −4th, +3rd, +4th, +5th, +6th or +1 oct; BALANCE blends the dry and harmony voices. A 和声 ("Harmony") preset joins the others. The After Hours echo adds tape wow and a darkening feedback path.
- **VU red zone**: the analyser now taps the board before the master compressor and limiter, so the needle shows what the pedals do. A clean strum sits near 0 VU; pushing a pedal's output or the master volume drives it into the red, where the red arc glows and a PEAK lamp flashes.
- **Phones page through the board** (Qiu's request): one pedal at a time sits centred and lit while its neighbours dim; a swipe snaps to the next pedal, and CENTAUR / BD-2 / PS-6 / ECHO tabs in the board heading show and choose the current one. Focusing a knob or stomp by keyboard brings its pedal to the middle. Desktop keeps all four in a row.
- **Phones**: the strings photo fades in just above the strings, so the preset and chord buttons sit on the dark room with a dark backing instead of on red lacquer; the tone caption is hidden to keep the five presets on one line, and the room clips the photo's overhang so it can never scroll sideways.

## 2026-10-08 · Light, texture and rooms of their own (pending user confirmation)

User feedback: keep the original nine-room grid content, the work room (表面之下 / 做法, "Beneath the surface / How I work"), the paths room's thread sphere and free dragging; what was missing was texture, the rooms all shared one layout, the home 3D model looked worse than the photograph, and the pedals were crude. This round layers on top of the existing implementation and does not replace room content.

- **Light from one window**: the `.daylight` layer inside `#room` (blind light patches, swaying leaf shadows, warm sunlight, paper grain, vignette) is fixed to the viewport with `pointer-events:none`. Each area changes the time of day through `#room[data-place]`; the strings room turns daylight off and keeps only its own lamp. Object shadows all fall lower-left, away from the window.
- **Home guitar** (superseded on 2026-10-09 by `open-world-brief.md`): the photo swap and tap-to-strum were a misreading and have been undone. The home room keeps the Three.js model with mouse-follow and click-to-pick-up, makes no sound, and only its look (materials, lighting) is being improved against the Rāna photograph.
  - *Look (2026-10-09, pending Qiu's review)*: `guitar-model.js` has two lighting rigs. The home render uses `lighting.room()`: warm key from the upper right (the daylight layer's window), paper-bounce fill, Neutral tone mapping, and an environment map with a slatted window to the side so the clearcoat picks up the blinds as the guitar turns. The close-up keeps `lighting.studio()` (ACES, dark softbox studio). The lacquer is a satin clearcoat, and a shader grade pulls only the red finish (not the bare-wood wear) of Qiu's darker body texture towards the official photo's warm cherry. The headstock face is gloss black (roughness .2) and the knobs are translucent amber. The 2D cast shadow in `scene.js` now falls lower-left, away from the window, in two layers like every other object; `guitar-home.webp` was re-rendered from the new look.
  - *Finish (2026-10-09, pending Qiu's review)*: modelled on ESP's own POTBELLY FM Rāna (ESP brand, ¥1,760,000): "Distressed See Thru Wine Red (Lacquer)", aged by hand; flamed maple top with natural binding, mahogany back and neck, hard maple board. The flame is chatoyant: as the guitar turns, the curl pattern rolls along the body (`figure` uniform from yaw/pitch) instead of losing contrast. The lacquer is graded towards ESP's pure wine red (sRGB ≈ 75,0,0) and the worn maple to a dirtier amber. Sides: natural maple binding along the top 8 mm, then wine red over mahogany; wear continues from what the front and back photographs show at that point of the edge, plus rubbed corners and chips. Back, scraped neck back and headstock back use ESP's back photograph (`esp-rana-back.webp`). Hardware is aged nickel rather than chrome.
  - *Checking and gloss (2026-10-09, Qiu's corrections)*: the cracks are the striking part of Qiu's guitar, more than any matte look, and they come from the aged nitro over the flamed maple top, so only the top's remaining lacquer checks. The mahogany sides and back, the neck, the headstock (back, edges and black face) and every patch worn to bare wood stay smooth. The top uses one solid crack pattern in guitar coordinates (`crackle()` in `guitar-model.js`: 3D Voronoi plates about 3 mm, a little longer across the grain, some edges left closed, plus a finer 1.3 mm network that only shows up close). Each plate tilts the clear coat by a tiny random angle, so reflections break into a mosaic while the coat still shines; cracks kill the coat and darken slightly. The lacquer is a gloss coat (clearcoat .9, roughness .2) over matte wood (roughness .6, low specular); every lacquered surface keeps that coat. Checking is masked to whole lacquer (red ratio .64–.8, so the frayed rim of a worn patch stays clean). Bare wood has no coat and almost no specular (specular colour × .2, F90 × .25, roughness .93): it scatters light rather than mirroring it. Both the crack lines and the plate tilt fade out where a plate is under a few pixels (the home view), so they never shimmer or alias.
  - *Neck, headstock and tuners (2026-10-09, Qiu's correction)*: the board is a 6 mm maple slab on one lofted C-profile mahogany neck. The neck swells into a volute behind the nut and flows into the headstock back. At the body end the shaft steps onto a heel block that sits flush with the back where the bass horn hugs the neck, and rounds off on the treble side. The back photograph is unrolled around the neck by arc length, so the sides keep its grain. The tuners are GOTOH, laid out from the back photograph: a pillow-edged worm barrel, a round gear case whose cover keeps the photograph's GOTOH stamp, a flange screwed to the wood, and a small rounded oval button. `esp-rana-back.webp` has the photographed housings painted out (the round covers are kept for the 3D cases to sample). The headstock back is registered with its own row fit (back row = 1.161 × front row − 11.9).
  - *Hardware details (2026-10-09, Qiu's correction)*: two nickel strap buttons on black felt washers, square to the side at the tip of the bass horn and at the tail (each at the outline's furthest point, halfway down the side). The two knobs are amber top hats built as a lathe: a skirt with moulded 0–10 numbers (a canvas texture, counting up anticlockwise as on ESP's photograph), a tall cap with a dished top and small dome, and the pot shaft inside. The plastic is a transmissive `MeshPhysicalMaterial`, so the wine-red top shows through it.
  - *Close-up handling (2026-10-09, Qiu's correction)*: the close-up turns all the way round. The camera looks at a point that can travel anywhere along the guitar: left-drag turns; right-drag (or middle-drag, or Shift-drag on a trackpad) moves; two fingers move and pinch; the wheel zooms toward the pointer (up to 6×); Shift plus the arrow keys moves. A legend at the bottom of the close-up spells out the controls with small mouse icons (left-drag to turn, right-drag to move, scroll to zoom), or one finger / two fingers on touch screens; ordinary visitors would never guess right-drag. The Body / Neck / Head / Whole buttons glide there and are only starting points.
- **Strings room (琴弦之间)**: a dark lamp-lit room. The strings are now a real body close-up (`jam-strings.webp`: pickups, bridge, six strings); a string sounds only when pressed or swept, never on hover, and a plucked string shows its vibration envelope. Adds a needle VU meter. The pedals (superseded on 2026-10-10 by the four-pedal board above) kept the three CENTAUR / BD-2 / AFTER HOURS units and the existing audio chain, and gained a pedalboard base, die-cast finish, knurled knobs, chrome footswitches, plugs and LED glow; the tape reels spin while the echo is on.
- **Sound**: the pluck synth adds pick position, slightly detuned dual polarisation and fractional-delay tuning; a small wooden-room reverb sits at the end of the chain. The first click on the strings turns sound on.
- **Room compositions** (desktop ≥701px): paths is diagonal (question top-left, 「还要选择吗。」 bottom-right); trace makes the whole room the paper with a vertical title on the right; blindspot is a centred poster; rethink is mirrored left-right. Narrow screens keep the original layouts.

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
