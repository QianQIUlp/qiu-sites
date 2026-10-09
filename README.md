# 千秋 (Qianqiu) · Me + QStudio

Two independent Astro static sites in one repository: `qiu.works` is the QStudio site, and `me.qiu.works` is Qianqiu's personal space (formerly `room.qiu.works`). The VeriSilo product site continues to be maintained in its own repository.

[![Astro](https://img.shields.io/badge/Astro-7.1-FF5D01.svg?style=flat&logo=astro&logoColor=white)](https://astro.build)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Build both Astro sites](https://github.com/qianqiulp/qiu-sites/actions/workflows/deploy.yml/badge.svg)](https://github.com/qianqiulp/qiu-sites/actions/workflows/deploy.yml)

## Site boundaries

| Entry | Role | App directory |
|---|---|---|
| `https://qiu.works` | QStudio identity, work, engineering principles, selected writing and contact | `developer/` |
| `https://me.qiu.works` | Guitar, playable pedalboard, loose-leaf pages, articles and project archive | repository root |
| `https://verisilo.qiu.works` | VeriSilo product description and conversion | separate VeriSilo repository |

The two sites have independent roles: QStudio presents the work, while Me presents Qianqiu as a person through music and spatial interaction. The personal site's Chinese and English homepages share Astro components, and English still keeps 「千秋」 (the Chinese name).

## Local development

The project requires Node.js `>=22.12.0 <23`; the repository pins `22.23.1` via `mise.toml`.

```bash
# Install dependencies for both apps
npm install
npm --prefix developer install

# Qiu's Room
npm run dev

# Developer Profile
npm run dev:developer

# Build both apps at once
npm run build:all
```

You can also use `npm run build`, `npm run build:developer`, `npm run preview` and `npm run preview:developer` separately. Build output goes to `dist/` and `developer/dist/`, neither of which is committed.

The prototype is wired into the production routes `/` and `/en/`; you can go directly to `/#music` or `/en/#music`. For source structure, audio boundaries and asset sources, see the [personal space maintenance notes](./docs/me-home.md).

## Cloudflare Pages

The following is the target deployment configuration; this code integration does not bind domains or publish to production. At release, the root site must be bound to `me.qiu.works`, and the old `room.qiu.works` must be kept or redirected so existing QStudio entry points keep working.

The same GitHub repository is connected to two Pages projects, both with production branch `main` and environment variable `NODE_VERSION=22.23.1`.

| Pages project | Root directory | Build command | Output directory | Custom domain |
|---|---|---|---|---|
| Developer | `developer` | `npm run build` | `dist` | `qiu.works` |
| Room | empty (repository root) | `npm run build` | `dist` | `me.qiu.works` |

`.github/workflows/deploy.yml` only runs the two static build checks and no longer publishes to GitHub Pages. Mail-related MX, SPF, DKIM and DMARC records are not part of the website deployment configuration.

## Repository structure

```text
qiu-sites/
├── developer/               # qiu.works standalone Astro app
│   ├── public/              # product screenshots, Room crops, share cards and favicon
│   └── src/                 # bilingual single page, layout, content and styles
├── src/                     # me.qiu.works Astro source
│   ├── assets/
│   ├── components/
│   ├── content/
│   ├── data/
│   ├── layouts/
│   ├── pages/
│   └── styles/
├── public/                  # Room static assets and share cards
├── docs/                    # content maintenance, design contracts and QA
└── .github/workflows/       # dual-site build checks
```

## Design and maintenance docs

- [Room homepage art direction](./docs/uiux/homepage-art-direction.md)
- [Room person-first intent](./docs/uiux/person-first-intent.md)
- [Room current visual contract](./docs/uiux/ink-and-light-study.md)
- [Developer editorial workbench contract](./docs/uiux/developer-workbench.md)
- [Visual QA Checklist](./docs/qa/visual-checklist.md)
- [Site maintenance notes](./docs/site-maintenance.md)

## License

[MIT](./LICENSE)
