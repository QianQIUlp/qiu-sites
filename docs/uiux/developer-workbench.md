# Developer Profile · Editorial Workbench

## 2026-09-30 · Font and control glyph consistency

- `/` and `/zh/` use pinned-version, self-hosted subsets of Source Sans 3, Source Serif 4, Cousine Bold and Noto Sans SC / Serif SC, keeping the roles of sans body text, editorial serif headings and bold mono labels. Source Sans 3 provides real 400–900 weights, Source Serif 4 is fixed at weight 400 with the default optical size, and Cousine uses a real 700 weight.
- Link arrows, the lens's two-way drag hint, the project expand plus and the image close glyph use build-time inline SVG and do not depend on system fonts; original copy, links, native details / dialog, lens position and language anchors are kept.
- When fonts fail, a readable system fallback remains. Font licenses are stored with the source and embedded in the WOFF2; after adding Chinese or English copy, run `scripts/subset-qstudio-fonts.py` per `developer/src/assets/fonts/README.md` to update the separate subsets.
- The Look inside deep-green first screen, colors, layout and real evidence images are kept. This change is handed back for review separately on top of personal-site PR #80; neither PR is auto-merged.
- Page width follows the available viewport, including the space taken by the scrollbar at 320px; the lower half of the lens handle that extends past the border continues to support dragging.

## 2026-09-23 · Look inside (current direction)

The current interaction draft in `prototypes/qstudio-look-inside.html` has been brought into `developer/`. This section supersedes the visual, section and interaction rules of the older editorial workbench below; the older content is kept only as a decision record. Requirements on the studio's real identity, product boundaries, bilingual routes, links and metadata remain in force.

- The first screen establishes the studio identity first with a deep-green background and a prominent 「Q Studio」 name, immediately followed by a statement in the matching language: 「构建本地优先的软件产品与开发者工具」 ("Building local-first software products and developer tools"). The right side marks VeriSilo as the current product and browser identity space; the real product-site screenshot is work evidence and does not replace the studio introduction. The circular lens can be dragged directly or moved with a native slider and keyboard; inside the lens is the real evidence screenshot in the matching language, panning with the position. The initial position shows the full observation value; at the far left the evidence title is fully visible, and fixed copy never substitutes for the screenshot.
- Below, a simple information flow covers work, way of working, founder, writing and contact. The four projects expand with native `details`, containing real screenshots, audience, boundaries and source links. `Me` jumps to the founder section; the personal-site preview stays a rectangular full image and links to `me.qiu.works` in the matching language.
- `/` (English) and `/zh/` (Chinese) both emit complete body text at build time. Language switching keeps the current anchor; screenshot assets use production site paths. Screenshot enlargement has a native image link as the no-JavaScript fallback.
- The page uses the prototype's fixed colors and layout and no longer offers the old day/night theme button, scroll section indicator, copy-email button or extra explanation panel. A 1200 × 630 OG image per language follows the new first screen.
- Check reading and no horizontal scrolling at widths 1440, 768, 375 and 320; check the lens's left and right endpoints, direct dragging, slider keyboard operation, project expansion, the image dialog, language and anchors.

`developer/` is a standalone Astro static app deployed to `https://qiu.works`, and it is the official site of Q Studio, an independent, self-funded software studio founded and operated by Qian Qiu. This contract governs only the developer homepage;
Qianqiu's personal site `me.qiu.works` continues to be governed by [`homepage-art-direction.md`](./homepage-art-direction.md),
[`person-first-intent.md`](./person-first-intent.md) and [`ink-and-light-study.md`](./ink-and-light-study.md).

## Role boundaries

Within ten seconds the developer homepage answers: what Q Studio is, who runs it, what it is building, what it has built, how it works and how to get in touch. It is the professional entry point for GitHub, Discord,
X, LinkedIn, partners and future clients; it does not carry the full personal narrative, nor does it do product conversion for VeriSilo.

The brand relationship is Q Studio by Qian Qiu: studio identity comes first, founder identity is kept. Qianqiu's personal site is the founder's personal space, not a studio product.

- `/` defaults to English, `/zh/` provides the complete Chinese counterpart;
- `me.qiu.works` covers the person, guitar, music, writing archive and complete project archive;
- the VeriSilo site covers user problems, product capabilities, downloads and feedback;
- the developer homepage only provides credible summaries and routing, without copying all content from either side.

## Visual direction

The name is **Editorial Workbench**: like a desk that has been carefully organized and is still in use, not a résumé template or marketing landing page.

- Warm off-white and charcoal form the Light/Dark base, with a slight warm light from the upper left; dark red is used only for lines, status and small accents;
- System sans-serif carries body text and primary information, serif is used only for the name and a few editorial headings, and mono only for status, numbering and project metadata;
- Whitespace, hairlines, alignment and a clear grid do the grouping, not stacks of generic rounded cards; the Hero brand name keeps clean typography without measurement-tick decoration; the current-focus card joins the list numbering system with a FILE number and status dot; product tiers are expressed with red-outlined chips (Primary / Public / Teaching); the Studio fact table is marked with 01–07 indexes and a current-focus square dot;
- Use real VeriSilo page/app images and a real personal-site preview, never generated fictional product UI; the VeriSilo evidence image and the personal-site preview are each taken per language from the matching page, the former keeping a complete, self-consistent composition, the latter showing the current first screen with 「千秋」 (Qianqiu) and the wine-red guitar;
- Do not use the room scene as a full-page background, and do not use tech-logo walls, terminal skins, SaaS gradients, dashboards or same-template card grids;
- Motion is limited to short fades and necessary feedback; under `prefers-reduced-motion` information appears immediately; navigation marks the section being read with a short red rule and `aria-current` (JS scroll awareness + `:target` fallback), and theme switching reveals the new theme as a circle from the button position where View Transitions are supported, switching instantly elsewhere.

## Fixed information architecture

1. **Hero** — Q Studio identity, founder Qian Qiu, the local-first / explicit boundaries axis, current focus VeriSilo, Selected Work / GitHub / Meet 千秋 (Qianqiu).
2. **Now Building** — VeriSilo's real status, Windows-first, open source, Chrome/Edge environment isolation and privacy-auditing boundaries.
3. **Selected Software** — Primary/current product VeriSilo; other public software Crewlight and MealCircuit; teaching lab Hadoop Lab (explicitly not a product). Each keeps only audience, problem, key design, status and links.
4. **Studio** — a visible fact table of Q Studio, founder, independent self-funded model, direction, current focus, contact email and public source.
5. **How I Build** — Local-first, Inspectable systems, Explicit boundaries, Reproducible infrastructure, User-controlled data.
6. **Selected Writing** — `me.qiu.works` articles in the matching language on LLM metacognition, Linux server hardening and resource usage rules.
7. **Beyond Work** — a first-screen preview of 「千秋」 and the guitar in the matching language, plus the `me.qiu.works` entry. The copy is 「工作之外，是千秋」 ("Beyond work, there is Qianqiu") / "千秋, beyond the studio", describing picking up the guitar, playing music, leafing through loose pages and leaving lines. The image is only a preview; clicking goes to the personal site's real homepage.
8. **Contact** — `qstudio@qiu.works`, GitHub, and the approved product-feedback / technical-collaboration "focused software work" copy.

The personal site's Chinese and English homepages, project records and articles all link to `https://me.qiu.works`; English keeps the name 「千秋」, and the old domain or the old Qiu's Room entry copy must no longer appear.

Do not list prices, do not promise to solve "any software problem", and do not fabricate users, metrics, experience, interfaces or product maturity. Do not add unverifiable information such as a registered company, funding, employees, revenue, clients, address or partners; structured data uses only Organization fields that really exist.

## Responsive behavior and interaction

- 1440px uses an asymmetric editorial grid; 768px narrows the columns; 375px and 375 × 667px become a clear single column;
- The page must not scroll horizontally, and primary touch targets are at least 44 × 44px;
- Skip links, navigation, language, theme, project and contact entries are all keyboard-operable with visible focus;
- Light/Dark have the same content, order and evidence; visible buttons keep `Day / Night` and 「昼 / 夜」 (Day / Night);
- Images reserve stable aspect ratios, and text and links must not depend on animation to appear.
- The VeriSilo evidence image must come from the current product page in the matching language; the personal-site preview reuses the merged `public/assets/og/me-{en,zh}.jpg` (1200 × 630), shown in full without cropping out the Chinese name or the guitar. When the personal site is redesigned, update the copies in sync; old room photos must not remain.
- The evidence image is currently taken from the `.evidence-section` of `verisilo.qiu.works` (`Confidence, with a trace.` / 「安心，有迹可循。」), 1440 × 710 in both languages. When replacing it, keep `work.imageHeight` in `developer/src/content.ts` and the `.evidence-trigger img` `aspect-ratio` in `developer/src/styles/global.css` in sync, so all three stay consistent and nothing distorts.

## 2026-09-22 · A browsable studio archive

This continues from the local commits that added editorial details, anchor fixes, section navigation and the light-style theme switch. The studio's distinctiveness comes from typography and real software; engagement comes from inspecting evidence and understanding trade-offs.

- The Hero uses a large Q Studio masthead spanning the grid, with the founder byline on the right; below, the left side holds a condensed studio stance and action entries, and the right side FILE 01, a real product preview and status. On mobile they stack in reading order.
- The four-item project index at the bottom uses the same numbering as Selected Software. Clicking goes directly to the project; the three secondary projects use native `details/summary` to expand status, audience, design trade-offs and existing links. Project tier, summary and teaching nature are always visible and remain readable by keyboard and without JavaScript.
- Both VeriSilo evidence entries reuse the same screenshot in the matching language. A native `dialog` offers fit-to-viewport and original-size views, with oversize content scrolling only within the image area. Closing or Escape returns to the triggering link; without JavaScript the image opens directly. Screenshot provenance is clearly labeled and does not pose as an operable product audit.
- On desktop the evidence image stays visible next to the matching product description; on mobile it returns to normal document flow. Images are shown in full; evidence is never lost to cropping or hover zoom.
- Navigation updates from real section positions and clears the marker on returning to the Hero. `:target` styling is used only without JavaScript; anchors keep a single offset, adapted to the actual header height. Language switching keeps an explicitly selected section or project anchor.
- The contact area keeps the mail link and adds copy-email with success/failure feedback readable by assistive technology. When the clipboard is unavailable, the address can still be used to get in touch.
- Continues the warm neutrals, restrained red, day/night themes and reduced-motion preference. All enhancements use native HTML/CSS/JavaScript with no added runtime dependencies.

## Metadata and deployment

- canonical, hreflang, Sitemap, robots and OG URLs all use `https://qiu.works`;
- title/description/OG explicitly associate Q Studio with founder Qian Qiu; `og:site_name` is `Q Studio`;
- the page contains minimal Organization JSON-LD: name `Q Studio`, url, email, founder `Qian Qiu`, sameAs GitHub and VeriSilo; no founding date, address, phone, employees or legal entity;
- Chinese and English each use a 1200 × 630 share card;
- Cloudflare Pages root directory is `developer`, build command `npm run build`, output directory `dist`;
- purely static output, with no SSR, Cloudflare adapter, form backend or additional frontend framework.
