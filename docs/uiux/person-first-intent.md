# First, Get to Know a Living Person

## 2026-09-22 · Approved implementation boundaries

The personal site's target domain changes to `me.qiu.works`; `qiu.works` presents the work through QStudio. The user approved a new spatial homepage built from 「千秋」 (Qianqiu, the Chinese name), their own guitar and music interaction. The current implementation rules are in the latest addendum to [`ink-and-light-study.md`](./ink-and-light-study.md); the original words, the old copy freeze and the PR audit records below are kept as history and do not override this explicitly approved new homepage. Existing article and project archive content is unchanged.

> For the homepage's higher creative origin, see [`homepage-art-direction.md`](./homepage-art-direction.md).
> This file only stores the long-term intent, content boundaries and PR #66 audit derived from it, and does not replace intuitive compositional judgment.
> `ink-and-light-study.md` describes the current visual implementation; when the three conflict, go back to the creative origin first.

## 2026-07 user correction

The current implementation uses a modern, realistic personal room as its visual base. It keeps person first, the guitar, the three project devices, warm light, restrained red,
progressive discovery and long-form readability; it removes visual decoration such as calligraphy/QiuBrush, seals, xuan-paper noise, petals and ink fluff.
Docs and QA refer to themes as **Light / Dark**; the visible button keeps 「昼 / 夜」 (Day / Night) and 「Day / Night」. Existing transitions and
reveals may stay but are described only as neutral interface feedback.

Copy is not rewritten along with the visual correction. The only permitted text changes are: removing 「展开卷宗」 ("open the dossier") and its English counterpart; changing the blog counts
「卷 / 题」 ("volumes / topics") to 「篇 / 标签」 ("articles / tags"); removing 「题跋」 ("colophon"); removing the visible 「授权协议 · 文末记」 ("License · end note") block. All other homepage,
shared interface, article and project copy keeps its pre-correction original text.

This correction changes the current visual surface, not the person-first intent below. The PR #66 audit and the completion criteria of that time are kept as historical records;
old terms appearing there only explain the implementation and judgment of that time and are not mandatory rules today.

## 2026-07-29 dual-homepage correction

Personal expression and professional identification are now handled by two cooperating entry points:

- `room.qiu.works` continues to answer "what kind of person is Qiu", keeping the rhythm of meeting the person first and then exploring writing/engineering/life;
- `qiu.works` answers "what is Qiu building, how do they work, how to get in touch", defaulting to English with its own editorial workbench design;
- `verisilo.qiu.works` only answers product questions and does not copy content from the personal homepage or Room.

Room received one item-by-item approved copy extension: Chinese and English identity anchors and first-screen self-description, developer homepage and contact entries, and the VeriSilo project archive.
This approval supersedes the scope of the earlier statement that "this correction does not grant broad authorization", but it is still not a broad rewrite authorization. The original quote, historical audits,
other shared interface and article text remain unchanged.

## Why this file exists

This site is not an engineer's portfolio with a bio attached, nor a brand page packaging Qianqiu as some aesthetic persona.
It should let someone who does not know Qianqiu gradually get to know several sides of the same person without being forced to read a résumé,
while keeping the freedom to choose which side to approach.

The visual scheme will keep changing. The room is the real space currently kept; xuan paper, ruled-line architectural painting, scrolls, cinnabar, calligraphy and decorative particles are old expressive tools that have left
the current scheme. None of them define Qianqiu as a person. What should be kept long-term is the following reading relationship:

1. **The person first, then categories.** The first screen answers "who is here", not "what sections are here".
2. **Gradual discovery, not one explanation.** Engineering, writing, life and unfinished judgments each provide an entry; the reader decides the order of exploration.
3. **Allow contradictions to coexist.** Gentle and sharp, pragmatic and passionate, certain and hesitant need not be compressed into one unified persona.
4. **Let metaphor speak first, and let content land afterward.** Light, shadow, the guitar and the space form the feeling first; articles, projects, concrete choices and everyday traces make that feeling credible after exploration.
5. **Let the content be cared for.** Design decisions should state "why", so future people or AI can judge what may be swapped and what must not be lost.

## How personality enters the page

"Passionate, sharp, real life" are not three labels waiting for illustrations, but that does not mean visual metaphor should step aside.
Quite the opposite: the first layer of understanding should be spoken for by light, shadow, the guitar and spatial depth; real content appears after the reader approaches,
so the metaphor does not decay into a hollow persona. Do not translate them literally into flames, blades, heart-rate lines, more red, or a set of personality badges.

### Passion is not a color

Passion shows through **sustained commitment and active choice**: being willing to maintain a project, think a problem through to the end, keep practicing guitar,
and take seriously the experience left by relationships and games. The page should let readers see the things being done, written and kept,
rather than directly declaring "I am a passionate person".

Usable evidence:

- projects, articles and external creative links that really exist in the repository and are still reachable;
- what was invested in something, why it continues, and where it is still unfinished;
- concrete objects and actions from life, such as guitar practice, rather than generic "hobby" icons.

### Sharpness is not aggression

Sharpness shows through **questions, judgments and boundaries**: asking whether a rule is reasonable, separating tools from purposes,
stating what a project does not solve, and leaving room to correct one's own judgments. Titles, summaries, project boundaries and original sentences from the body
can carry this force; visually it needs no sharp corners, warning colors or high-contrast slogans.

Usable evidence:

- real problem awareness and judgment in published articles, such as resource usage rules, LLM metacognitive blind spots,
  and the distinction between "liar game / role game";
- constraints, trade-offs, failure conditions and "what we don't do" in project archives;
- honest statements of uncertainty, rather than packaging everything as a success story.

### Real life is not decorative intimacy

Life shows through **concrete but bounded traces**: how guitar practice, games, relationships and everyday experience enter thinking,
and which parts are chosen not to be made public. The guitar can be a real entry, but it cannot alone stand in for "life";
the room scene is also just an atmospheric interface and does not claim to be a real residence.

Usable evidence:

- existing life side notes, reflective articles and real external profiles;
- a first-person introduction with explicit self-limits;
- honest blank space when content is absent, never generating photos, experience, status or emotions to fill the layout.

## Three entries, still one person

The homepage may use the desk, workbench, guitar and life as progressive entries, but they are not three personas:

- **Writing** lets readers see how judgments form, not just the number of articles;
- **Engineering** lets readers see capability, constraints and trade-offs, not just a tech stack;
- **Life** lets readers see from what everyday experience these judgments grow, not just contact details.

All three entries should lead back to real content. No entry may swallow the others, nor summarize Qianqiu as any single label among
"writer", "engineer" or "guitarist".

## Why the homepage and inner pages must be one world

"One world" does not mean carrying the homepage screenshot onto every page; it means space and reading follow the same set of modern, restrained rules:

- Same hierarchy: importance is expressed by font size, weight, contrast and whitespace, not stacked cards or decorative labels;
- Same light source: when shadows are needed they follow the room's main light direction, avoiding contradictory lighting;
- Same materials: photos keep real walls, wood, metal, fabric and rubber, with no overlaid xuan-paper texture or global noise;
- Same font roles: headings, body and UI use clear regular fonts, without building identity through QiuBrush or calligraphy;
- Same restraint: red is only a sparing accent and does not carry seal, cinnabar or classical-annotation meaning;
- Same motion: transitions and reveals only provide necessary feedback and do not change composition, information or reading order.

The homepage may be more spatial, and inner pages flatter and better suited to long reading; but materials, color semantics, font-family roles,
interaction feedback and content ethics must be consistent. When readers go from the room into an article or project, it should feel like approaching material on the same desk,
not jumping from an immersive homepage into another card template.

## Immutable intent and replaceable implementation

### Immutable

- Let readers get to know the person first, then consume the content;
- A multi-faceted, progressive, selectable process of getting to know them;
- Real evidence first; never fabricate personal experience or project facts;
- Long Chinese reading, keyboard operation, mobile and reduced motion all work;
- Static site, few dependencies, maintainable long-term;
- Docs keep design rationale and acceptance questions.

### Replaceable

- How the room is presented, and specific metaphors that have left the current scheme, such as ruled-line architectural painting, scrolls, black-silk ruling and "day xuan / night ink";
- Scene images, hotspot positions, motion durations and layout;
- Color values, font sizes and spacing used without changing content meaning;
- Navigation and entry copy after obtaining the user's item-by-item authorization; 2026-07-29 approved only the identity anchor, developer/contact entries and the VeriSilo archive.

When replacing the visual implementation, there is no requirement to replicate the old surface; only that the new implementation passes this file's long-term acceptance questions again.

## Content boundaries

- Show only articles, projects, statuses, links and images that the repository or user-supplied material can prove.
- Without reliable timeliness information, use 「最近留下的痕迹」 ("traces left recently") rather than 「此刻正在做」 ("doing right now").
- Do not generate or fabricate personal photos, project screenshots, experience, user counts, performance metrics, emotions or maintenance commitments.
- Do not write inferences as self-statements; get user confirmation before adding new facts.
- Do not add empty routes, content categories, runtime dependencies or server capabilities for the sake of visual completeness.
- Blank space in private life is also a content boundary; do not demand more exposure in the name of being "more real".

## Historical record: PR #66 implementation audit baseline

The audit below is kept as it was. Old visual terms and status judgments are only for tracing PR #66 and do not override the 2026-07 user correction.

Audit subject: `feat(design): 墨光书房 — 界画视觉系统全站落地 (#66)` ("Ink-and-light study — ruled-line painting visual system rolled out site-wide"), merge commit
`51ef6d6`. That PR made theme, scene, ruling lines, fonts and atmosphere layers into a working system, but the visual scheme's completeness
was higher than the completeness of the higher-level person intent.

| Requirement | PR #66 status | Evidence and gaps |
| --- | --- | --- |
| Static, buildable, no new runtime dependencies | Mostly done | Astro production build passes and existing routes generate |
| Day-xuan/night-ink and theme transitions | Mostly done | Theme state, reduced motion and rapid-click cleanup are implemented |
| Progressive homepage exploration | Mostly done | Three hotspots, in-place close-ups, hash and no-JS content exist |
| First, get to know a living person | Partly done | The first screen has the name and the real guitar, but the self-introduction is too thin and the life entry lacks on-site content evidence |
| Passion, sharpness and real life emerge naturally | Not done | Relies mainly on room and guitar imagery; article judgments, project boundaries and life side notes do not yet illuminate each other |
| Homepage and inner pages belong to one world | Partly done | Nominally share the "墨光书房" ("ink-and-light study"), but the homepage has its own hard-coded colors and inner pages still keep multi-layer card backgrounds and hard-edged images |
| Restraint in cinnabar, script fonts and seals | Partly done | The contract has rules, but ordinary links/component inscriptions and multiple seals still overstep |
| Visual intent can be inherited by future maintainers | Partly done | The current contract writes the specific scheme as the highest principle, the old person-first intent is marked as abolished, and there is no stable/replaceable layering |
| Mobile touch and dual-theme visual evidence | Partly done | Responsive rules exist, some touch targets are small; the PR lacks independent review/check, and old QA evidence does not match the current state |

Non-visual verification used in the audit included: production build, HTTP smoke tests of generated routes, internal links, duplicate `id`s,
image size/alt text and external-link `rel` checks. Browser dual-theme screenshots should be regenerated after this round's implementation,
and pre-PR screenshots should not be taken as evidence of the current state.

## Historical record: completion criteria for that round

That round was not considered complete by adding another explanatory framework, but by the following observable results:

1. The first screen stays minimal, letting only Qianqiu, the guitar and a little breath of life stay in the light; the desk, workbench and information volume recede into shadow first.
2. After the reader approaches, lingers, touches or makes a choice, the other entries gradually appear through changes in light, shadow or ink, rather than unfolding all at once.
3. Once expanded, the life entry links to existing on-site article evidence, no longer just a guitar image and external links.
4. Article and project titles, summaries and boundaries carry the personality once discovered; the first screen does not turn them into a list explaining the person.
5. Homepage colors map to the site-wide paper/ink tokens; the homepage and inner pages no longer have unrelated background color systems.
6. Inner pages remove unnecessary card backgrounds, rounded boxes and hard-edged images, using whitespace, double ruling lines, indentation and ink-faded edges instead.
7. Ordinary links do not use cinnabar; QiuBrush returns to a two-place signature allowlist; the interface no longer shows seals.
8. Primary mobile navigation and the theme button reach comfortable touch sizes, with no page-level horizontal scrolling at 375px.
9. The creative origin, current visual contract, design skill and QA checklist reference each other and no longer contradict each other.
10. Production build and route/link static checks pass; home, article index, article page and projects page complete day/night and desktop/mobile verification.

## Historical record: re-audit for that round

The conclusions below only state that the "not done" or "partly done" implementation gaps from PR #66 received verifiable responses on the branch at that time;
they do not claim the homepage's aesthetics are now final. Intuitive composition still defers to `homepage-art-direction.md` and the author's actual viewing.

| Non-basic item from PR #66 | Status then | Evidence then |
| --- | --- | --- |
| First, get to know a living person | Implemented | First sight keeps only the name, the guitar and one line of life; full sections and content counts are hidden at first |
| Passion, sharpness and real life emerge naturally | Implemented | Light, shadow and the guitar speak first; after approaching, real articles, project judgments and life side notes carry it on, with no new personality labels |
| Homepage and inner pages belong to one world | Implemented | Homepage switched to site-wide paper/ink tokens; inner pages removed extra card backgrounds, rounded paper slips and hard-edged images |
| Restraint in cinnabar, script fonts and seals | Implemented | Ordinary links returned to ink color, QiuBrush kept only for the empty-cover signature and TOC inscription, and the interface no longer shows seals |
| Visual intent can be inherited by future maintainers | Implemented | Creative origin, long-term person intent, replaceable visual contract, design skill and QA are layered and cross-referenced |
| Mobile touch and dual-theme visual evidence | Implemented | Primary controls reach 44px; no horizontal overflow at 375px; day/night, desktop/mobile screenshots archived |

## Long-term acceptance questions

Every visible change must answer:

1. Without clicking any entry, does the reader first see Qianqiu, or a visual style or product template?
2. After removing all personality adjectives, does the page still convey concrete commitment, judgment and life?
3. Are engineering, writing and life all discoverable, with no one side swallowing the others?
4. Can readers choose their own order of exploration and always know how to return to the whole?
5. Is the page still suitable for long Chinese content, keyboard operation, mobile, both themes and reduced motion?
6. Do decoration, motion and copy come from real content relationships, rather than existing to fill the layout?
7. If the next version swaps the room's visual surface again, can it still explain how it keeps the person-first intent here?
