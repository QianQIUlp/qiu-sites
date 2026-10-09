# Asset Prompts · Scene asset regeneration prompts

This directory stores the **regeneration prompts** for the homepage room scene images. The current homepage uses low-noise photorealistic assets
(`src/assets/home/practice-room-*-{day,night}.png`); the page organizes content with modern negative space, clear hierarchy, warm light and restrained transitions,
and does not bake paper grain, global noise or decorative particles into room materials. The existing `home-room-ink-*` filenames are historical compatibility paths only
and do not represent the active visual direction.

## Usage

1. Generate with an image-capable model (e.g. Gemini image / GPT-image) using the Prompt in the matching md file.
2. Every view must be generated as a strictly registered day/night pair; the frame must match the live one, or hotspots and code UI will misalign.
3. After generating, review against the Checklist item by item, write versioned files into `src/assets/`, then update references and run `npm run build`.
4. After replacing, run the homepage dual-theme entries in `docs/qa/visual-checklist.md`.

## Shared constraints (all prompts)

- Same room: overview / writing / projects must read as push-ins within one real space.
- Each day/night pair shares camera position, composition, objects and contacts; only time, lamp state, exposure and the matching shadows change.
- Walls are snow-white matte paint; wood, metal, fabric, leather and rubber each show their real material.
- No grain, paper texture, embossed worm-like squiggles, or one generated texture spanning different materials; accept at low-ISO real-photo quality.
- The positions of the Supro, gold and blue pedals and cables on the overview's right workbench are a composition lock; pedals must lie flat and obey the desk's support plane.
- Images embed no introduction text, UI, decorative seals or watermarks; visible text is overlaid by code in a regular font.

## Files

- `home-room-ink-overview.md` — day/night overview
- `home-room-ink-writing.md` — desk close-up (「写作」 / "Writing" hotspot)
- `home-room-ink-projects.md` — workbench close-up (「作品」 / "Projects" hotspot)
- `home-room-ink-curtain.md` — curtain close-up (「生活」 / "Life" hotspot)
