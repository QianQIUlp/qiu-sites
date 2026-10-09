# Person-First Room and Editorial Workbench Design Contract

> **Historical archive**: for the homepage creative origin see [`homepage-art-direction.md`](./homepage-art-direction.md),
> for the long-term person-first intent see [`person-first-intent.md`](./person-first-intent.md), and for the current visual implementation see
> [`ink-and-light-study.md`](./ink-and-light-study.md). This file only records how the early room concept took shape
> and no longer carries active rules.

## Overarching positioning

This is Qianqiu's personal space, not an engineer's portfolio with a bio attached. Engineering, writing, learning, games, life and ideas that have not yet reached a conclusion are all different sides of the same person; no single project or methodology may serve as the master formula that explains the whole person.

## Page roles

- The homepage is an explorable personal rehearsal room: first let visitors see Qianqiu, then let them choose a direction from the desk, the workbench or the guitar.
- The article index handles discovery and archiving; article pages handle quiet, continuous long-form reading.
- The projects page is the engineering workbench; it may raise information density but is still one room in the personal space.
- The "小书房" ("little study") keeps its warmth and slow-reading feel but no longer monopolizes the whole site's voice.

## Visual grammar

- The base tone is warm paper, deep green, warm orange and Chinese editorial typography.
- The whole site shares one desk-side light source from the upper left; paper pages, covers and sticky notes use the same shadow direction.
- The homepage is the spatial exception to this language: dark red curtains, a warm tungsten lamp, the desk and the workbench form one persistent 2.5D room, and content is not chopped into a card waterfall.
- The room overview, desk close-up and workbench close-up use 4K masters and let Astro output responsive versions per viewport; curtains, guitar and the spatial base image remain separate depth layers and must not be re-baked into one background that can only scale as a whole.
- The homepage's aged wine-red guitar follows the real-instrument reference supplied by the user; the headstock, mixed bridge-position pickups, wear positions, the 3/5/7/9/15/17/19/21 dot inlays and the 12th-fret `m` mark spanning frets 11–13 are identity details and must not be swapped casually.
- A Chinese serif is used for headings, a sans-serif for body text, and monospace only for repository names and technical metadata.
- Use open indexes, tracks, paper pages and dossiers instead of stacking generic cards or glass panels.
- The homepage's three object entries only change the room state within the same page: the desk eventually drops the real article index into the monitor, the workbench drops the real engineering archive onto the desk mat, and the guitar unfolds life side notes in place; the entries themselves must not fake camera movement with a delayed navigation.
- The camera combines overview zoom, close-up alignment, curtain shift, guitar foreground shift, slight walking bob and late-stage content reveal, about 2.4 seconds one way; on arrival the URL only records `#writing-desk`, `#project-workbench` or `#life-corner`, and the site's existing routes continue to be reached through real links inside the scene.
- No WebGL, Canvas, scroll hijacking, continuous mouse tracking or new runtime dependencies. The homepage must not play a zoom animation on first load, so object scale never shrinks from large to small.
- Article body text stays still; all camera and entrance motion fully respects `prefers-reduced-motion`. With JavaScript off, the three hash landings and back links still work, and content is visible and accessible by default.

## Content boundaries

- Show only articles, projects, statuses, links and images the repository can prove.
- Without reliable timeliness information, use "最近留下的痕迹" ("traces left recently") rather than "此刻正在做" ("doing right now").
- The room background is an atmospheric scene and does not claim to be a real residence; the guitar asset is calibrated only against the real photos the user supplied and is not used to fabricate experience.
- Do not generate or fabricate personal photos, project screenshots, experience, user counts, performance metrics or maintenance commitments.
- Do not add empty routes, content categories, runtime dependencies or server capabilities for the sake of visual completeness.

## Long-term acceptance questions

Every visible change should answer:

1. Does the first screen present Qianqiu as a person first, or some product landing page?
2. Are engineering, writing and life all discoverable, with no one side swallowing the others?
3. Is the page still suitable for long Chinese content, keyboard operation, mobile and dark mode?
4. Do decoration, motion and interface copy come from real content relationships rather than template inertia?
5. After the camera arrives, are we still in the same room, rather than an ordinary route navigation dressed up as animation?
