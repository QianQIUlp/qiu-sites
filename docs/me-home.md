# 千秋 (Qianqiu) · me.qiu.works

2026-09-30: homepage fonts switched to pinned-version, self-hosted WOFF2 subsets, and control glyphs switched to inline SVG. The existing spatial composition, copy and navigation are kept; for details and the regeneration method see `src/assets/me/fonts/README.md`. This fix is handed back to the user for review as a PR; it is not merged, and local acceptance is not taken to imply release.

2026-09-22: wired the user-approved bilingual spatial prototype into the root Astro site. `qiu.works` is still served by QStudio in `developer/`; that app is not changed here.

2026-09-29: the user approved implementing the nine-grid expansion, project cross-sections with auto demo, and guitar performance optimizations from `prototypes/me-current.html` into source. The original style is kept, and neither source nor build output depends on the prototype directory. This authorization covers local implementation and acceptance; deployment and PR are left for review.

## Source

2026-10-17 (open-world step 4): the homepage is organised **one room per module**. Each room has one script (`src/scripts/me/rooms/<place>.js`) and one stylesheet (`src/styles/me/rooms/<place>.css`); shared systems sit behind a context object. No visual or behavioural change came with this; computed styles and screenshots were compared room by room.

Pages and markup:

- `src/pages/index.astro` and `src/pages/en/index.astro`: production homepage entries.
- `src/layouts/PersonalHome.astro`: the homepage's own layout, bilingual SEO, share image and no-JavaScript reading entry. It imports `src/styles/me/home.css` and `src/scripts/me/boot.js` only.
- `src/components/me/Room.astro`, `MoreRooms.astro`, `Pedalboard.astro`: shared bilingual page and pedal markup, with initial copy emitted at build time; interactive copy uses `language.js`, with no translation library. Every room except home is emitted with `data-asleep` (and the loose pages' layer with `data-asleep="papers"`): `content-visibility: hidden` until its module wakes it, so its fonts and images are not fetched on first load.

The room contract (`src/scripts/me/scene.js`, top of file):

```js
export default {
  place: 'music',
  mount(ctx) {},      // once, the first time the room is needed
  enter() {},         // the camera has arrived here
  leave() {},         // the camera has gone elsewhere
  frame(now, dt) {},  // every camera frame while mounted; return true to ask for another
  paint(g, now) {},   // draw on the shared world canvas (world space), when in view
};
```

All hooks but `place` are optional. `ctx` offers: `room`/`world` (DOM), `t`/`english`, `places`, `active`, `camera`, `width`/`height`/`dpr`, `motion`, `light` (the afternoon hour), `inView(place)`, `schedule()` (ask for a camera frame), `go(place)`, `found(key)` (retire a lesson, see `hints.js`), `sound` (below), `use(place)` (another room's public side, mounting it if needed, e.g. the paths room plays through `ctx.use('music')`), and `on('motion' | 'resize', fn)`. Rooms never reach into each other's DOM or state; cross-room effects go through `ctx`.

Scripts:

- `src/scripts/me/boot.js`: registers the rooms (`define(place, loader)`) and starts the scene. Home is bundled with the first paint; every other room is its own chunk, loaded and woken after the page's `load` event on idle (nearest first), or immediately when the camera heads toward it, enters it by `#hash`, or zooms out to the overview. The 3D guitar (`guitar-model.js`, Three.js and its textures) loads on idle or on the first touch, move or key in the room, or when the close-up opens; until then `guitar-home.webp` stands in at the same place.
- `src/scripts/me/scene.js`: camera, drag and coast, pinch and wheel zoom, keyboard travel, routing by `#hash`, the room bar, portals, and the room registry.
- `src/scripts/me/places.js`: where each room sits (room-size units from home), its name and the room bar hint.
- `src/scripts/me/sound.js`: the audio context, the shared pedal rig (`sound.params`), the two Sound switches and small room sounds (`roomsound` events).
- `src/scripts/me/room-kit.js`: helpers several rooms share (`surface`, `sway`, `dragInput`, `clamp`, `still`).
- `src/scripts/me/rooms/home.js`: the guitar on the world canvas, mouse-follow tilt, the close-up dialog, and when the 3D model loads.
- `src/scripts/me/rooms/papers.js`: loose pages as paper: throwing, landing in other rooms, and the window light that shows each page's back and pencil draft.
- `src/scripts/me/rooms/music.js`: the strings (photo plus `#jam-strings` canvas), chords, A S D F G H and Space, the four pedals and their knobs, the phone pedal pager, the looper and the VU meter.
- `src/scripts/me/rooms/trace.js`: pencil lines that become tuned strings, drawn on the world canvas.
- `src/scripts/me/rooms/rethink.js`, `work.js` (+ `work-specimen.js`, the on-demand Three.js sculptures), `idle.js`, `paths.js`, `blindspot.js`: the step-3 rooms.
- `src/scripts/me/hints.js`: the quiet tutorial: every room's ordered lessons (one-time demonstration, then the pencil note), and the `me-found` record that retires both.
- `src/scripts/me/afternoon.js`: 不赶时间 ("No hurry"): time that passes only while the visitor is still, the clock, dust, lamp and evening line, and the hour (`--hour`, `--gold`, `--dusk`) shared with every room.
- `src/scripts/me/guitar-model.js`: the Three.js guitar built from photo projection plus geometry; `guitar-surface.js`, `guitar-surface-worker.js`, `guitar-batches.js` compute the same body surface in the background and merge static hardware draws.
- `src/scripts/me/audio-engine.js`: native Web Audio plucked-string synthesis, overdrive, filtering and feedback echo.
- `src/scripts/me/icons.js`, `language.js`: shared SVG paths and the zh/en switch for runtime copy.

Assets:

- `src/assets/me/`: four local textures and two lossless model previews; Vite emits content-hashed static URLs with no dependency on the prototype directory.
- `src/vendor/three/`: Three.js 0.180.0 carried over from the prototype, keeping its MIT LICENSE. The site has no runtime npm dependencies beyond Astro; `@playwright/test` is a development dependency for the checks below.

Styles (`src/styles/me/home.css` imports them in cascade order):

- `fonts.css`: homepage-only fonts. `base.css`: tokens, reset, the world and what rooms share (headings, small actions). `chrome.css`: masthead, room bar and map, view tools, language switch, sleeping rooms. `atmosphere.css`: window light, the afternoon hour and the lamp, shared by every room. `notes.css`: pencil notes shared parts.
- `rooms/<place>.css`: everything that is only that room's, including its English variant (`html[lang=en] …`), its light and shadow, and its pencil notes. The loose pages' paper stock and subset faces live in `rooms/papers.css`.

Checks (`tests/home/`):

- `npm run test:home`: Playwright smoke test (`smoke.spec.mjs`, `playwright.config.mjs`): builds, serves with `astro preview`, then in zh and en at 1280×800 and 390×844 visits every room by hash and performs its main interaction (see the list below), failing on console errors, page errors, failed requests or HTTP errors. It uses the installed Chrome (`PW_CHANNEL=chromium` for Playwright's own) and reduced motion. It takes about 1.5 minutes locally, so it is not in CI.
- `parity.mjs`: reference screenshots of every room (zh/en, desktop/phone, reduced motion, lessons already found) and a pixel comparison. `styles.mjs`: the computed style of every element in every room, and a comparison. Use both before and after any refactor that should not change the look.
- `weight.mjs`: first-load transfer by type at the `load` event and after idle, against `astro preview`.

Main interaction per room (what the smoke test does): home, open and close the guitar close-up; papers, turn a page; music, stomp the Centaur and strum (sound turns on); trace, "Give me a starting point" adds a line; rethink, "Think again" walks the thought; work, choose the "limits" depth (reading 100); idle, toss a slip into the hollow; paths, "Listen to this path"; blindspot, "Another angle" (20°) and turn the test card; overview, the portals appear.

First load (2026-10-17, `astro preview`, compressed transfer at the `load` event): `/` 1808 KB in 20 requests before step 4, 529 KB in 9 after; `/en/` 1617 KB → 359 KB. Everything else still arrives after load and idle (about 2.1–2.3 MB in total, unchanged).

Run `npm ci`, `npm run dev`. Before release run `npm run build`, `npm run preview` and check the real build output. Homepage code loads only on the homepage; reading pages keep their existing layout and themes.

## Routes and interaction

Chinese `/`, English `/en/`; both languages keep the name 「千秋」 (Qianqiu). The nine-grid's top row is `#paths`, `#trace`, `#blindspot`, the middle row `#papers`, `#home`, `#music`, and the bottom row `#rethink`, `#idle`, `#work`; `#overview` shows the whole map. The map, spatial entries, dragging and keyboard all navigate. Language switching keeps the position, but a full-page navigation clears temporary recordings, paper positions and lines. Article sources in the loose-leaf pages and added areas point to the Chinese originals; 「所有文章 / 项目档案」 ("All articles / Project archive") go to the existing list in the matching language.

The entry guitar turns slightly with the mouse; clicking opens a close-up. The close-up supports dragging, zoom, arrow keys, detail positions, Space to reset and Esc to go back. Nothing renders continuously when idle or off-screen; the reduced-motion preference and the manual motion toggle both stop following and easing. When WebGL cannot initialize, the homepage keeps a preview of the same model and the close-up keeps the reference photo.

「另一面」 ("The Other Side") lets one continuous paper strip carry the correction of a judgment; 「盲点」 ("Blind Spot") keeps the Chinese character form 「确定」 ("certain"), with an English side note explaining its meaning, and turning it reveals self-corrections left in real articles. 「未走之路」 ("The Road Not Taken") can change the bundle of lines and the route, and sound is enabled only after actively clicking to listen; 「不赶时间」 ("No Rush") lets you drag or click to put down four 「应该」 ("shoulds") and restore them at any time.

「拆开看看」 ("Take It Apart") uses four symbolic sculptures to carry the real problems, approaches and boundaries of VeriSilo, MealCircuit, Crewlight and Hadoop Lab, without claiming to be physical hardware models. On first entry and every time a project is selected, a full 13.4-second showcase auto-plays once; it can be paused, resumed and replayed. Manually dragging the cross-section or choosing a stage takes over the demo, leaving pauses it, and once played an ordinary return does not restart it. With motion off, the cross-section showcase stays and the camera orbit is cancelled.

The music area supports six strings, A S D F G H, Space to strum, and Open / Em / G / C / D. The twelve knobs turn by dragging around the shaft (or vertically), the scroll wheel, arrow keys, Shift for fine adjustment and double-click to reset. All four pedals (Centaur, Blues Driver, Harmonist, After Hours, in signal order left to right) can be bypassed, and five presets provide starting points.

It starts muted; audio starts only after the user plays or turns sound on, and the microphone is never requested. A 6-second loop records pitch and velocity and can be overdubbed; all layers share the current effects, not separate tracks. In the background, recording and the loop pause and output is muted; on return the loop does not resume automatically. Recordings are not kept after refresh.

## Assets and expression boundaries

The guitar model is the user-confirmed **BanG Dream! POTBELLY FM Rāna**, with the BanG Dream! logo on the headstock. The neck pickup is an SH-1n with a silver cover; the bridge SH-16 is an open reverse zebra, with the cream coil toward the neck and black toward the bridge.

| Asset | Source and use |
| --- | --- |
| `qiu-potbelly-stringless.png` → `.webp` | String-removed derivative of the user's own photo, 1064 × 1478; used at runtime for pickup and hardware detail |
| `qiu-potbelly-bare-body.png` → `.webp` | Derivative of the same photo with strings and hardware removed, 1064 × 1478; used at runtime as the body base material |
| `bangdream-potbelly-stringless.png` → `.webp` | String-removed derivative of the official front reference, 1254 × 1254; used at runtime for the fretboard and headstock string paths |
| `bangdream-potbelly-fm-rana.png` → `.webp` | ESP official front reference, 2400 × 2400; used at runtime for headstock markings, loading fallback and WebGL fallback |
| `guitar-home.webp` | Neutral frame of the same 3D model under the home room lighting (`drawHome(0,0)` at pixel ratio 1.5), 1275 × 1275, lossless transparent WebP; shown first and hidden once the model draws its first frame. Re-render it whenever the model's look changes |
| `jam-strings.webp` | Body close-up cut from the same official photograph (pickups, bridge, six strings), rotated landscape, 860 × 620; the playable strings in the strings room |
| `esp-rana-back.webp` | ESP's official back photograph of the ESP-brand POTBELLY FM Rāna (`ESP_POTBELLY_FM_Rana_back.png`, 2400 × 2400), mirrored into the front photograph's frame (x = 2392 − x), cropped to x 760–1630 (870 × 2400), edges dilated so the outline never samples background, and the six photographed tuner housings painted out with the headstock's own grain (their round GOTOH covers are kept for the 3D tuner cases to sample). Runtime texture for the body back (registered to the outline: x 768–1615, y 1262–2377), the neck back and heel (nut at row 412, 2611 px per metre down the neck) and the headstock back (row = 1.161 × front row − 11.9) |
| `work-home.webp` | Neutral frame of the approved VeriSilo sculpture, 1191 × 636, lossless transparent WebP; shown while the showcase loads |

PNGs are kept as texture source files; the homepage and the Three.js runtime load same-size high-quality WebP (quality 95). The four textures dropped from 4.95 MB to 1.05 MB in total, about 79% smaller.

The entry preview is about 211 KB and loads with priority; since step 4 the model's textures load with the model (on idle or first touch), not on first paint, and the official reference image (`#guitar-photo`, `loading="lazy"`) is fetched only when the model or the close-up needs it. The surface is computed in a Worker bundled by Vite, and when Workers are unavailable it yields the main thread in batches; static geometry is merged by material, and texture sizes, vertices, normals and UVs match the prototype. The project 3D code loads only when the showcase is visible and stops rendering off-screen. The prototype's local performance comparison is kept as development evidence and must not be taken as a speed promise on visitors' networks.

Official sources: [model page](https://espguitars.co.jp/collaborate/33185/), [front image](https://espguitars.co.jp/wp-content/uploads/2023/11/BanGDream_POTBELLY_FM_Rana_front.png). Official images and brand marks belong to their respective rights holders and are not covered by the repository code's MIT license.

During prototyping, imagegen removed strings and hardware from the real photo, which were then rebuilt as separate geometry so strings and switches are not baked into the finish. This integration reuses the approved textures directly. Occluded wood grain is painted in, back and side materials are approximate reconstructions, and the model is not a scan of the real instrument; no verifiable matching official back image was found, so full 360° rotation is not enabled.

The tone is plucked-string synthesis inspired by classic pedals, not real-guitar samples or circuit emulation of the original units. The BD-2's appearance references the [BOSS product page](https://www.boss.info/us/products/bd-2/). Prototype audio checks covered output, bypass, mute, maximum gain, echo tails and all nine knobs (the 2026-10-10 board adds the Harmonist's three knobs, a stomp click, tape wow and a pre-limiter VU tap); integration keeps the audio algorithm and only adjusts module paths.

## Release boundaries

Astro `site`, canonical, language alternates, robots and sitemap point to `https://me.qiu.works`. This is only a source integration — **not published and no Cloudflare domain bound**.

At release, bind `me.qiu.works` to the root-site Pages project and confirm TLS and the Chinese and English paths; keep the old `room.qiu.works` reachable or configure a redirect that preserves path/query parameters, so QStudio and external old links do not break. Unpushed changes on the main QStudio site's current branch are not included in this personal-site branch.
