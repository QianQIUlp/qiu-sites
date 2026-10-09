# Contributing to qiu-sites

Thanks for your interest in this project! To keep collaboration and review efficient, please follow these guidelines before contributing.

## 🛠️ How do I get the development environment running?

This project is built with the [Astro](https://astro.build/) framework. To develop and preview locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/qianqiulp/qiu-sites.git
   cd qiu-sites
   ```
2. **Install dependencies**:
   Make sure Node.js is installed locally (v22+ recommended).
   ```bash
   npm install
   ```
3. **Start the dev server**:
   ```bash
   npm run dev
   ```
   Once started, open `http://localhost:4321` in a browser for a local preview with hot module replacement (HMR).

## 🧪 What should I do before submitting code?

Before opening a PR or committing, make sure you complete this self-check list:
- [ ] **Local verification**: preview locally with `npm run dev` and confirm the changed pages' styles and behavior are as expected (responsive layout, light/dark mode, etc.).
- [ ] **Build test**: run `npm run build` and make sure there are no Astro or TS compile errors.
- [ ] **Clean up**: do not commit temporary files, logs or sensitive configuration.

## 📝 How do I write a commit message?

This project strictly follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. Every commit should have a clear, structured message so the changelog can be generated cleanly.

Format:
```text
<type>(<scope>): <subject>
```

Common `<type>` values:
- `feat`: a new feature (e.g. a new blog post, a new page component)
- `fix`: a bug fix (e.g. fixing a layout misalignment or a broken link)
- `docs`: documentation changes (e.g. updating README, CONTRIBUTING)
- `style`: formatting changes (whitespace, formatting that does not affect logic)
- `refactor`: code refactoring (a change that neither fixes a bug nor adds a feature)
- `perf`: performance improvements
- `chore`: changes to the build process or auxiliary tools

Examples:
- `feat(blog): add 2026-05-26-llm-metacog-blindspot post`
- `fix(ui): enforce 16:9 aspect ratio and cover fit on blog cards`

## 🔀 What is the PR process?

1. **Create a branch**: branch off `main` into a dedicated feature or fix branch:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-name
   ```
2. **Commit and push**: once development is done and verified locally, push the code to your remote branch.
3. **Open a Pull Request**:
   - Target the `main` branch.
   - Fill in the PR template (loaded automatically), briefly describing your changes and how you verified them.
   - If it resolves an issue, write `Closes #<number>` in the PR description so the issue closes automatically on merge.
4. **Wait for review**: a project maintainer will review your PR and merge it into the main branch once approved.
