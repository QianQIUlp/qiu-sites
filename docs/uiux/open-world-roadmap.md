# Open World · Roadmap (steps 4–6)

> The plan for the homepage after steps 1–3. Read `open-world-brief.md` first (the vision), then this file (what to do next).
> Agreed with Qiu on 2026-10-17. Every session working on the homepage updates the **Status** section below before it ends, so the next session never depends on chat history or memory.

## Status

| Step | State | Where |
| --- | --- | --- |
| 1 · Guitar | Done, merged | PR #84 |
| 2 · Pedalboard room 琴弦之间 ("Between the Strings") | Done, merged | PR #85 |
| 3 · Every room gets its own idea | Done, merged (rounds 3–6 merged without Qiu's review; treated as accepted) | PR #86 |
| 4 · Solid ground | Not started | branch `feat/me-open-world-foundation` |
| 5 · One world, not nine rooms | Not started | same branch |
| 6 · Polish and launch checks | Not started | same branch |

## How we work (Qiu's rule, 2026-10-17)

Qiu's energy is limited and decisions are more tiring than execution. So:

- **One branch, one PR** for steps 4–6 (`feat/me-open-world-foundation`). Each step is a series of small commits; push as work lands and keep the PR body current.
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

## Decisions log

Record defaults taken without asking Qiu, one line each: date, step, decision, why.
