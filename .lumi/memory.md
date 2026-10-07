## Git Commit Message Format

- Always use Conventional Commits style: `type(scope): subject`.
- `scope` is optional but preferred when the change is localized to one module/file area (e.g., `blog`, `nav`, `css`, `theme`).
- `subject` is written in Chinese, imperative voice, **≤ 50 chars**, no trailing period.
- Allowed `type` values and when to use each:
  - `fix` — bug 修复
    - 例: `fix(blog): 补全 blog/index.html 缺失的 doctype 与 head`
  - `feat` — 新功能
    - 例: `feat(nav): 主页卡片区添加博客入口`
  - `refactor` — 重构（不改外部行为）
    - 例: `refactor(css): 抽取公共变量到 style.css`
  - `docs` — 仅文档变更
    - 例: `docs: 更新 README 反映 blog 与 assets 目录结构`
  - `chore` — 杂活 / 配置（不影响业务逻辑）
    - 例: `chore: 添加 .gitignore 排除系统文件`
  - `style` — 仅格式化、空格、缩进，不改语义
    - 例: `style: 统一缩进为 2 空格`
  - `perf` — 性能优化
    - 例: `perf: 压缩首页背景图为 WebP`
- Never invent new `type` values. If none fit, ask the user before committing.

## Commit Granularity

- **HARD RULE**: 一个 commit 只做一件事，title 能在 50 字内讲清"做了什么"。
- Before suggesting `git commit`, mentally split the working tree diff by **intent**. If two unrelated intents exist, propose **two separate commits**.
- Always pair `git add` with the matching files for each commit. **Never use `git add .`** when the working tree has mixed intents.
- Suggested workflow when changes are mixed:
  1. List changed files grouped by intent.
  2. Propose `git add <files-of-intent-1>`.
  3. Propose `git commit -m "<type>(<scope>): <subject>"`.
  4. Repeat for the next intent.
- Do NOT batch type-changes into one commit (e.g., never mix `fix` + `feat` in a single commit).
- Reference splitting example (a large refactor PR can fan out into several commits):
  - `refactor(css): 在 style.css 中定义 CSS 变量（颜色 / 间距 / 字体）`
  - `refactor(css): 抽取 index.html 公共样式到 style.css`
  - `refactor(css): 抽取 projects.html 公共样式到 style.css`
  - `feat(theme): projects.html 接入深色模式变量`
  - `fix(css): 修复 .post-card 在深色模式下的背景色`

## PR Description Template

- Every PR description must follow this **exact** section structure (preserve the four `##` headers and their order):

```

## 做了什么

- 一句话概括变更（≤ 3 行）

## 为什么

- 引用 Issue: Closes #N
- 一句话讲动机（例: blog/index.html 缺 doctype，浏览器靠容错渲染，不规范）

## 怎么测

- [ ]  打开 https://me.qiu.works/blog/ 看页面正常
- [ ]  DevTools Console 无报错
- [ ]  在移动端尺寸下视觉正常

## 截图（如有视觉改动）

[Before] → [After]

```

- Section rules:
  - `## 做了什么` — ≤ 3 lines, summary only, no diff narration.
  - `## 为什么` — must include `Closes #N` if an issue exists; otherwise state the trigger in one sentence.
  - `## 怎么测` — concrete checklist items a reviewer can actually run/click. Replace the example URLs with the actual deploy target for the current repo.
  - `## 截图` — keep the section header even when there are no visual changes; write `无视觉变更` inside instead of deleting the section.
- For pure docs / chore PRs with no runtime impact, `## 怎么测` may collapse to a single bullet, e.g. `- [ ] 不涉及运行时，仅文档 / 配置变更`.
- Always offer to **generate** the PR description after a feature branch is ready, but **never push or open the PR** without an explicit user command.

## Git Branch Naming

- Format: `<type>/<kebab-case-summary>`
- `type` MUST match the commit `type` taxonomy already defined above (`fix` / `feat` / `refactor` / `docs` / `chore` / `style` / `perf`).
- `summary` rules:
  - lowercase only
  - words joined by `-` (kebab-case), no underscores, no camelCase
  - 2–5 words, describing **what** the branch changes, not the priority or ticket id
  - no trailing slash, no `.`, no Chinese characters
- One branch = one PR = one focused intent. If you find yourself wanting `feat-and-fix/...`, split into two branches.
- Reference samples (from the actual repo):
  - `fix/blog-index-html` — 补全 blog/index.html 为完整 HTML（P0 hotfix）
  - `fix/missing-blog-css` — 创建 blog/blog.css，补齐文章依赖样式（P0 hotfix）
  - `feat/homepage-blog-entry` — 主页和 projects 页加博客入口链接
  - `refactor/extract-shared-css` — 把三处内联 CSS 抽到 style.css
  - `feat/seo-meta-tags` — 全站加 meta description + Open Graph
  - `chore/gitignore-and-format` — 加 .gitignore、统一缩进、更新 README
- Priority labels (e.g., `P0 hotfix`) live in the **PR / Issue metadata**, NOT in the branch name.
- When proposing a new branch, output the exact command, e.g.:
  - `git checkout -b fix/blog-index-html`
- If the user is mid-edit on `main` / `master`, propose creating the correct branch **before** the first commit, not after.
- Branch ↔ commit consistency: the branch `type` and the first commit `type` should generally match. If they diverge (e.g., branch `refactor/...` but first commit is `fix(...)`), flag it and ask whether to re-scope.
