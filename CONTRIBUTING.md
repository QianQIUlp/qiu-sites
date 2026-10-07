# Contributing to qiu-sites

感谢你对本项目的关注！为了能高效地协同开发和审查，请在提交贡献前遵循以下指引。

## 🛠️ 怎么把开发环境跑起来?

本项目使用 [Astro](https://astro.build/) 框架构建。要在本地进行开发和预览，请执行以下步骤：

1. **克隆仓库**：
   ```bash
   git clone https://github.com/qianqiulp/qiu-sites.git
   cd qiu-sites
   ```
2. **安装依赖**：
   确保你的本地环境已安装 Node.js (推荐 v22+)。
   ```bash
   npm install
   ```
3. **启动开发服务器**：
   ```bash
   npm run dev
   ```
   启动后，可以在浏览器中打开 `http://localhost:4321` 进行本地预览，且支持热更新 (HMR)。

## 🧪 提交代码前要做什么?

在提 PR 或 Commit 前，请确保完成以下自测清单：
- [ ] **本地验证**：通过 `npm run dev` 本地预览，确认修改的页面样式与功能均符合预期（响应式布局、深浅色模式等）。
- [ ] **构建测试**：运行打包命令 `npm run build`，确保没有 Astro 或 TS 编译错误。
- [ ] **清理冗余**：不把临时文件、日志或敏感配置提交上去。

## 📝 Commit message 怎么写?

本项目严格遵循 [Conventional Commits](https://www.conventionalcommits.org/)（约定式提交）规范。每次提交的代码应当有清晰、结构化的提交信息，以确保 Changelog 能够被清晰生成。

格式如下：
```text
<type>(<scope>): <subject>
```

常用 `<type>` 类型：
- `feat`: 新增功能（如新博客文章、新页面组件）
- `fix`: 修复 Bug（如修复布局错位、链接错误等）
- `docs`: 文档变更（如更新 README, CONTRIBUTING）
- `style`: 代码格式调整（不影响逻辑的空格、格式化等）
- `refactor`: 代码重构（既不修复 bug 也不添加新功能的代码更改）
- `perf`: 性能优化
- `chore`: 构建过程或辅助工具的变动

示例：
- `feat(blog): add 2026-05-26-llm-metacog-blindspot post`
- `fix(ui): enforce 16:9 aspect ratio and cover fit on blog cards`

## 🔀 PR 流程是什么?

1. **创建分支**：从 `main` 分支切出一个专门的特性分支或修复分支：
   ```bash
   git checkout -b feat/your-feature-name
   # 或者
   git checkout -b fix/your-bug-name
   ```
2. **提交与推送**：在本地开发完成并确认无误后，将代码推送到你的远程分支。
3. **发起 Pull Request**：
   - 目标分支选择 `main`。
   - 填写 PR 模板（会自动载入），简明扼要地描述你的更改和验证方式。
   - 如果解决了某个 Issue，请在 PR 描述中写明 `Closes #编号`，以便在合并时自动关闭该 Issue。
4. **等待 Review**：项目维护者将会对你的 PR 进行审查，并在通过后合并入主分支。
