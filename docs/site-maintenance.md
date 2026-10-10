# Site Maintenance Notes

This document supports ongoing maintenance of Qiu's Room. Its goal is to lower the context cost of editing articles, editing the projects page and making UI adjustments.

## Local startup

Install dependencies the first time you enter the repository:

```sh
npm install
```

Day-to-day development:

```sh
npm run dev
```

Run a production build at least once before committing:

```sh
npm run build
```

When you need to inspect the build output:

```sh
npm run preview
```

`dist/`, `.astro/` and `node_modules/` are generated or dependency directories; do not commit them.

## Adding an article

Articles live in `src/content/posts/`; file names use a date-prefixed URL-safe slug:

```text
YYYY-MM-DD-topic.md
```

Frontmatter must match `src/content.config.ts` (the example values below are Chinese site copy: "Article title", "A short summary used by the list page, SEO and the article header.", "Article cover description"):

```yaml
---
title: "文章标题"
date: 2026-06-17
tags: [Tech, Reflection]
description: "用于列表页、SEO 和文章头部的简短摘要。"
ogImage: ../../assets/posts/topic/cover.webp
ogImageAlt: "文章封面说明"
toc: true
license: "CC BY-NC 4.0"
---
```

Required fields:

- `title`
- `date`
- `tags`
- `description`

Optional fields:

- `ogImage`
- `ogImageAlt`
- `toc`
- `license`

Put article images in `src/assets/posts/<post-slug>/`. Cover and body images should each have a clear purpose; Markdown images in the body need meaningful alt text. After editing an article, run `npm run build` to confirm the content collection, image paths and static routes all pass.

Long essays, long tutorials and long technical articles should by default open with an introductory `<aside>`. Its usual structure is fixed to these Chinese headings (kept verbatim because they are site copy):

- `关于这篇文章` ("About this article")
- `适合谁读` ("Who should read it")
- `怎么读这篇文章` ("How to read this article")
- `版权与声明` ("Copyright and notice")
- `首发与转载` ("First publication and reposting")

When writing the introduction:

- `关于这篇文章` covers only the topic, tension and writing intent, without marketing tone.
- `适合谁读` and `怎么读这篇文章` can be short lists.
- If there is no external first-publication link, `首发与转载` defaults to "首发于：Qiu 的小屋（本站）" ("First published at: Qiu's Room (this site)").

Multi-chapter technical guides, manuals and long reference articles get `toc: true` by default. The table of contents is generated centrally by `src/pages/blog/posts/[...slug].astro`; do not hand-write TOC navigation.

If an article enables `toc: true` and wants "关于这篇文章" to appear before the TOC, the introductory `<aside>` must be the first top-level block in the body; do not put any extra paragraph, image, H1 or other HTML block before it.

## Adding a project

Projects page data is centralized in `src/data/projects.ts`. Before adding to or editing `/projects/`, read:

- `src/data/projects.ts`
- the relevant `docs/project-briefs/*.md`

When adding a real project, write a project brief first, then settle the displayed copy into `src/data/projects.ts`. Project copy states only evidence-backed facts and does not add unconfirmed information such as user counts, performance metrics, maturity or production readiness.

Field maintenance notes:

- `featuredProjects` is for real project showcases.
- `secondaryProjects` is for secondary content such as site infrastructure, archive entries and learning threads.
- `selectedGuidePostIds` must match article slugs that exist in `src/content/posts/`.
- External links set `external: true`; they render with a new tab and a safe `rel`.
- `docker-hadoop-cluster` is the project's real repository slug; old `dockder-hadoop-cluster` links are all misspellings. The project's public display name is `Hadoop Lab`; the slug is only used for the repository URL and links.

## UI checks

After a UI change, first run:

```sh
npm run build
npm run preview
```

Then check manually against `docs/qa/visual-checklist.md`. Cover at least:

- `/`
- `/blog/`
- `/projects/`
- affected article pages
- desktop, 768px, 375px
- light and dark mode

Focus on:

- No page-level horizontal scrolling.
- No obvious post-load shift of images, fonts, TOC or article header.
- Article body is readable; code blocks and tables scroll horizontally on their own on narrow screens.
- Focus states are clear and Tab order follows the visual reading order.
- External link targets are correct, and `target="_blank"` links carry `rel="noopener noreferrer"`.

## Fields and boundaries not to change casually

Do not change these unless the task explicitly requires it:

- The article schema in `src/content.config.ts`.
- The existing route structure: `/`, `/blog/`, `/blog/posts/[...slug]/`, `/projects/`.
- Article frontmatter field names.
- The project data field structure and confirmed project facts.
- Site-level configuration in `astro.config.mjs`.
- Site-wide metadata in `BaseLayout.astro` such as canonical, OG, favicon and theme-color.
- Site resources under `public/` such as favicon, apple touch icon and robots.

Style changes go preferably in:

- `src/styles/global.css`
- `src/styles/blog.css`

Do not add lots of inline CSS for local effects. Do not introduce a new UI framework, React, Tailwind, shadcn or runtime frontend dependencies to solve problems static CSS can solve.

## What Codex should read before UI changes

Before making UI changes, Codex or any other maintainer should read at least:

- `AGENTS.md`
- `.agents/skills/qiu-site-frontend-design/SKILL.md`
- `.agents/skills/qiu-site-frontend-design/references/qiu-site-visual-brief.md`
- `.agents/skills/qiu-site-web-design-guidelines/SKILL.md`
- `.agents/skills/qiu-site-web-design-guidelines/references/web-interface-guidelines.md`
- `docs/qa/visual-checklist.md`
- `src/layouts/BaseLayout.astro`
- `src/components/SiteHeader.astro`
- `src/styles/global.css`
- `src/styles/blog.css`
- the relevant page files: `src/pages/index.astro`, `src/pages/blog/index.astro`, `src/pages/blog/posts/[...slug].astro`, `src/pages/projects/index.astro`

When changing the article experience, also read:

- `src/content.config.ts`
- at least one long article and one image-heavy article

When changing the projects page, also read:

- `src/data/projects.ts`
- the matching project brief under `docs/project-briefs/` (`verisilo.md`, `meal-circuit.md`, `crewlight.md`, `docker-hadoop-cluster.md`)

Keep the UI direction a "warm study": quiet, readable, personal and suited to long Chinese text. Do not turn the site into a generic AI SaaS, marketing landing page or stacked-card dashboard.
