# Open World · Agreed Brief for the Next Round (2026-10-09)

> This file records the understanding Qiu and Claude confirmed after several rounds of back-and-forth, so a new conversation can pick up without Qiu re-explaining.
> Read it fully before changing the homepage. It takes precedence over the 2026-10-08 section of `ink-and-light-study.md` marked "pending user confirmation".

## In one sentence

Keep the **spirit** of the original site, not its exact structure: a free, open world full of imagination and possibility. Visitors should feel that freedom and creativity **through their own hands**, so interaction is the core. The original already had some of this; this round pushes it much further, making it more interesting, more engaging, more inviting to play with.

## Confirmed direction

1. **The skeleton is a philosophy, not a structure.** Free dragging, wandering between the nine rooms, and the sense of freedom when you let go are the soul of the site. The structure can grow new things, but must never become "boxes that fence you in".
2. **The experience must be new.** Surprises everywhere, carefully crafted details, playful moments. Things should make people want to reach out and touch them. No "text on the left, widget on the right" panels.
3. **The guitar is the heart; make it better, never replace it.**
   - The home room has the original 3D guitar: large, tilted, centred, **turning to follow the mouse**; **clicking picks it up** into the 3D viewing experience (turn it, get closer, look at body / neck / headstock). Behaviour matches `main`.
   - What can improve is how it looks: materials and lighting, so it reads like the real Rāna (use the `bangdream-potbelly-fm-rana.webp` photo as reference).
   - **The home guitar does not make sound.** Sound interaction lives in other rooms, primarily the pedalboard room (琴弦之间 / "Between the Strings").
4. **The pedals are a love letter, not a widget.** They should be the most finely crafted objects on the whole site: recognisable individual pedals (Centaur, BOSS BD-2, a harmony pedal), knobs that really turn, stomps that feel satisfying, and audible changes in sound. Keep the VU meter; Qiu finds it novel.
5. **Each room is an idea, not a layout.** Moving text onto a diagonal, setting it vertically, or centring it is not originality. Originality comes from what the room **does** when you play with it.
6. **Keep the light and texture.** Window light, leaf shadows, paper grain and cast shadows are the one part of the last round that was approved. It is atmosphere, not the point.

## Must keep

- Free dragging and wandering across the nine-room grid, including the inertia and freedom when you let go.
- The sphere in the top-left room "如果结局一样，还要选择吗？" ("If the ending is the same, do you still choose?"); its texture and quality were explicitly praised.
- The bottom-right portfolio room "表面之下 / 做法" ("Beneath the surface / How I work").
- The home 3D guitar's mouse-follow and pick-up.
- The VU meter.

## Past mistakes (do not repeat)

- **v3**: bold and entirely new, but it lost what makes the site Qiu's own (the portfolio, the paths sphere, free dragging, the guitar's presence). It became a different website: everything boxed in, layouts formulaic.
- **ec12233**: brought all of that back but nearly reverted to the original site plus lighting; the ambition was lost. It also misread two remarks:
  - "Nothing chaotic on mouse movement" referred to the rooms, not the guitar. The guitar's mouse-follow was wrongly turned off.
  - "A guitar image I really like that sounds beautiful when clicked" meant making the existing guitar look better. Instead the 3D model was swapped for a flat photo and the click became a strum.
- **The pattern**: every time Qiu pointed out something missing, it was treated as "revert to the old version". What Qiu actually meant was "**keep that, and keep changing everything around it**". Never lose the whole picture while fixing individual points.

## How to work

One thing at a time, with Qiu reviewing each step before the next:

1. **Guitar**: restore the 3D model and its follow / pick-up interaction, then improve how it looks.
2. **Pedalboard room**: make the pedals the most crafted objects; sound interaction is concentrated here.
3. **Other rooms**: one at a time, each finding its own "idea".

Check each step yourself in the browser, show Qiu screenshots, and only commit, push and open a PR (per `AGENTS.md`) after Qiu approves.

**Update 2026-10-10 (Qiu):** step 3 goes into one PR (#86) for all rooms. Keep moving without stopping for approval after each room; push as work lands, send screenshots, and ask Qiu only when a decision is genuinely theirs.

## Branch state (`feat/me-living-rooms`, commit ec12233, not pushed)

| Change | Disposition |
| --- | --- |
| Window light, leaf shadows, grain and shadows in `atmosphere.css` | Keep |
| Pluck timbre and small-room reverb in `audio-engine.js` | Keep |
| VU meter | Keep |
| Pedal finish, plugs, LEDs, tape reels | Redone in step 2 (2026-10-10): four pedals, see `ink-and-light-study.md` |
| Home guitar swapped for `rana-home.webp`, `guitar-home.webp` deleted | **Undo**: restore `guitar-home.webp` and the original preview from `main` |
| `guitarInteraction=false`; `.guitar-touch` turned into a strum (`homeVoicing`) | **Undo**: restore mouse-follow, give `.guitar-touch` back `data-open-guitar`, restore the caption copy |
| Strings room turned into a dark lamp-lit room with a real string close-up (`jam-strings.webp`) | Kept; Qiu confirmed in step 2 |
| New compositions for paths, trace, blindspot and rethink rooms | Only layout shuffles; reconsider room by room in step 3. Do not touch the paths sphere itself |
| Wording in `SKILL.md` and `ink-and-light-study.md` saying the home uses a photo instead of 3D | Revert together with step 1 |
