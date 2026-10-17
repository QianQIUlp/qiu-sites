# Open World · Roadmap (steps 4–6)

> The plan for the homepage after steps 1–3. Read `open-world-brief.md` first (the vision), then this file (what to do next).
> Agreed with Qiu on 2026-10-17. Every session working on the homepage updates the **Status** section below before it ends, so the next session never depends on chat history or memory.

## Status

| Step | State | Where |
| --- | --- | --- |
| 1 · Guitar | Done, merged | PR #84 |
| 2 · Pedalboard room 琴弦之间 ("Between the Strings") | Done, merged | PR #85 |
| 3 · Every room gets its own idea | Done, merged (rounds 3–6 merged without Qiu's review; treated as accepted) | PR #86 |
| 4 · Solid ground | Done, merged: one module + one stylesheet per room behind the room contract, `npm run test:home` smoke test, parity screenshots and computed styles identical; first load `/` 1808 → 529 KB (20 → 9 requests), `/en/` 1617 → 359 KB | PR #87 |
| 5 · One world, not nine rooms | Done: four connections (a route becomes a line in the trace room; the pedals show in the trace room and the path threads; evening softens the sound in every room; thrown pages and routes leave threads on the overview), two rough edges fixed; `npm run test:home` covers each (8/8) | branch `feat/me-open-world-foundation`, PR #88 |
| 6 · Polish and launch checks | Not started | same branch, PR #88 |

## How we work (Qiu's rule, 2026-10-17)

Qiu's energy is limited and decisions are more tiring than execution. So:

- **One branch, one PR** for steps 4–6 (`feat/me-open-world-foundation`; #87 was merged after step 4, so steps 5–6 continue in draft PR #88). Each step is a series of small commits; push as work lands and keep the PR body current.
- **No approval stops between steps.** Qiu reviews once, at the very end.
- **Decide by default.** When a choice has a sensible, reversible default that fits the brief, take it and record it in the Decisions log below. Ask Qiu only when a choice is irreversible or outward-facing, or is a genuine taste fork with no defensible default; even then, pick a reversible default meanwhile, and batch the questions into the final hand-off.
- **Final hand-off to Qiu** is short: what changed in a few lines, at most ten "try this" items, and any batched questions. No screenshot floods mid-way.
- Verify everything yourself in the browser (desktop and phone, `/` and `/en/`); `npm run build` must pass (`ASTRO_TELEMETRY_DISABLED=1` if telemetry errors).
- All agent-facing text in English (see `AGENTS.md`).

## Step 4 · Solid ground

**Goal:** make the homepage code safe and fast to keep changing. **No intended visual or behavioural change.**

1. **Room modules.** Define one small contract every room plugs into, for example `src/scripts/me/rooms/<place>.js` exporting `{ place, mount(ctx), enter(), leave(), frame(now) }`, where `ctx` offers the shared services (audio rig, camera/pointer state, reduced-motion, language, hints, afternoon light). `scene.js` keeps only the camera, drag/coast, routing and the room registry. Move room logic out of `scene.js`, `nine-rooms.js` and `extra-rooms.js` into per-room modules; keep `audio-engine.js`, `hints.js`, `afternoon.js` and `guitar-model.js` as shared systems behind `ctx`.
2. **Room styles.** One stylesheet per room (e.g. `src/styles/me/rooms/<place>.css`) plus shared base/tokens/atmosphere files. Fold the override layers (`atmosphere.css` room rules, `english.css`, `more-rooms-english.css`, per-room bits of `style.css`) into the room's own file, using `:lang(en)` or the existing language hook for English. Goal: the look of a room is explained by one file.
3. **Loading.** First paint should need only the home room. Measure first-load transfer before and after. Keep `guitar-home.webp` as the instant preview; load Three.js and the guitar textures after first paint / on idle or intent; load each room's heavy assets (fonts, textures, canvases) when the camera approaches that room. Nothing may pop in visibly when a room is entered at normal speed.
4. **Smoke test.** Add a Playwright test (`npm run test:home`) that, in zh and en, at desktop (1280×800) and phone (390×844): visits every room by hash, performs that room's main interaction once, and fails on console errors, page errors or failed requests. Add it to CI only if it is stable and under a minute.
5. **Parity check.** Before refactoring, capture reference screenshots of every room (zh/en, desktop/phone) and a short list of interactions per room; after, compare and fix any difference. Unchanged visuals and behaviour are the definition of done.
6. Update `docs/me-home.md` and `.agents/skills/qiu-site-frontend-design/` with the new file layout and the room contract.

**Done when:** the room contract is documented and used by every room, per-room styles replace the override layers, first load is measurably lighter, the smoke test passes, and parity screenshots match.

## Step 5 · One world, not nine rooms

**Goal:** the rooms answer each other, so the house feels like one open world. Build on the step-4 contract (cross-room effects go through `ctx`, not through one room reaching into another).

- **Start with a fresh walk-through as a visitor,** zh and en, desktop and phone. Fix rough edges in the step-3 rooms (rounds 3–6 were never reviewed by Qiu), keeping each room's idea.
- **Then add a few connections, chosen by judgment against the brief.** Directions to consider, not a checklist:
  - **Sound:** the pedalboard's current tone colours sound made in other rooms (trace strings, path threads).
  - **Things that travel:** a page thrown out of 几张散页 ("Loose pages") is still lying where it landed.
  - **Light and time:** the 不赶时间 ("No hurry") afternoon, already shared, reaches every room's objects.
  - **Traces of the visit:** what you did in one room leaves a small mark visible from the overview.
  - **The overview:** zooming out shows the house as one living place.
- **Prefer three excellent connections to ten thin ones.**
- **Constraints from the brief:** keep free dragging and its coast; nothing chaotic on mere mouse movement; never box things in; the home guitar stays silent; don't touch the paths sphere itself or the portfolio room's content.

**Done when:** a visitor who wanders the house notices at least a few moments where one room remembers or answers another, every connection works on phone, and the smoke test covers them.

## Step 6 · Polish and launch checks

- **Accessibility:**
  - reduced motion (every animated room has a calm fallback);
  - keyboard reachability for every interactive object;
  - screen-reader labels in zh and en;
  - focus visibility;
  - contrast in the dark strings room.
- **Performance budget:** set first-load and per-room budgets from the step-4 measurements and keep to them; check the 3D guitar and canvases on a mid-range phone profile.
- **Metadata:** OG images and metadata still describe the current homepage (`astro.config.mjs`).
- **Visual checklist:** run `docs/qa/visual-checklist.md` for the homepage; update it for the new rooms.
- **Docs:** bring `ink-and-light-study.md`, `me-home.md` and the frontend-design skill up to date; mark the brief's old "Branch state" table as historical.
- **Final hand-off** to Qiu as described above, and the PR ready to merge.

## Notes for step 5 (from step 4)

- The contract, file layout and checks are documented in `docs/me-home.md` (Source). Cross-room effects: use `ctx.use(place)` to reach another room's public side (the paths room already plays through `ctx.use('music').pluckFrom(...)`), `ctx.light` for the afternoon, `ctx.sound` for anything audible.
- Rooms other than home mount after load (idle) or on approach. A connection must not assume the other room is mounted: `ctx.use()` mounts it on demand.
- Found by the smoke test, left for step 5 because step 4 changes no behaviour: at desktop size the paths room's three route buttons (「穿过去 / 绕一段 / 停一下」, "Through / Around / A pause") sit under `.path-instrument` and cannot be clicked (same before step 4). The smoke test uses "Listen to this path" there until it is fixed; switch it back to a route button then.
- Run `node tests/home/parity.mjs capture <dir>` before changing a room and `compare` after; a deliberate change should show only in the rooms it meant to touch. Reference screenshots from before step 4 are in the shared session notes folder (`step4-parity-before/`), not in the repo.

## Notes for step 6 (from step 5)

- Reduced motion: the new threads and the written line need nothing animated (the line commits at once, the threads are drawn statically); the echo shivers are skipped when motion is off. Throwing a page needs motion (it only moves under reduced motion), so keep the smoke test's motion toggle.
- Keyboard and screen readers: the paths footer button and the pedal switches are ordinary buttons; the line tag `↳ …` is drawn on the canvas, so the trace caption `.trace-through` (aria-live) is the screen-reader side of the board connection. The overview threads have no text alternative yet (decorative).
- Contrast: the evening label in the strings room is `#f2ebdcb3` on near-black; the trace caption mixes the pedal colour 55% into ink. Check both in step 6.
- Performance: the overview adds a few dashed lines at most; trace imports `audio-engine.js` (already in the music chunk) for the harmony note name.
- Step 5 changed no room's resting look except the phone Motion toggle's position (now in the room bar); use `tests/home/parity.mjs` if a visual regression is suspected.

## Decisions log

Record defaults taken without asking Qiu, one line each: date, step, decision, why.

- 2026-10-17 · 4 · Rooms other than home load and wake (module plus `data-asleep` → `content-visibility`) after the page's load event on idle, nearest first, and at once on approach, `#hash` entry or overview, rather than only on approach: every room neighbours home, so approach-only would show room fonts arriving on the first drag. Reversible in `boot.js` / `scene.js`.
- 2026-10-17 · 4 · The 3D guitar (Three.js plus textures) loads on idle or on the first pointer move, press or key in the room, or when the close-up opens; `guitar-home.webp` stays the instant preview. The texture preloads in `PersonalHome.astro` were removed and `#guitar-photo` is `loading="lazy"`.
- 2026-10-17 · 4 · Room markup stays in `Room.astro` / `MoreRooms.astro` (no per-room components yet), so the rendered HTML is unchanged apart from `data-asleep`. Splitting it is cheap later if a room grows.
- 2026-10-17 · 4 · The lessons table stays in `hints.js` (a shared system per this roadmap) instead of moving into each room module.
- 2026-10-17 · 4 · The smoke test runs on a production build with reduced motion and the installed Chrome (`PW_CHANNEL` overrides): software rendering is too slow for eased camera travel. It takes about 1.5 minutes including the build, so it is not in CI.
- 2026-10-17 · 4 · Added `@playwright/test` as a dev dependency; deleted `src/styles/home-room.css`, which nothing imported.
- 2026-10-17 · 5 · PR #87 had been squash-merged after step 4, so steps 5–6 continue on `feat/me-open-world-foundation` (fast-forwarded to main) in draft PR #88, worked in a separate git worktree to leave the shared checkout alone.
- 2026-10-17 · 5 · The walk-through found few real problems; fixes were limited to the two above. Every room keeps its idea and copy.
- 2026-10-17 · 5 · Connections chosen: route → line, the board shown in the trace room and path threads, evening warms the sound, threads on the overview. Left out on purpose: pages thrown into the idle hollow (they would vanish and could block reading), more links per pedal (clutter on the overview), a visited-rooms checklist (reads as a game and boxes the visitor in).
- 2026-10-17 · 5 · Evening softening is a fixed, gentle curve (cabinet −3.4 kHz, room +0.15 at full dusk) with a desktop-only label; reversible in `audio-engine.js` `warm` and `music.css`.
- 2026-10-17 · 5 · The route you send is the thread you chose, or the red route as it stands when none is chosen, so the footer button always does something. The received line does not retire the "draw a line yourself" lesson.
