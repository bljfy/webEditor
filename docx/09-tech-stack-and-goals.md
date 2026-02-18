# 09 技术栈方案与实现目标

## 概述
本方案用于指导“Schema 驱动的配置化页面生成系统”落地实现，确保与既有架构规范一致。
产品目标用户为不懂代码的普通人，工程选型和实现顺序必须服务于低学习成本与高可操作性。

## 技术栈方案
- 前端框架：`React + TypeScript + Vite`
  - 用于快速构建 Panel 与 Preview，提供类型安全。
- Schema 校验：`Zod`
  - 用于 `PageConfig` 校验、默认值注入、输入契约统一。
- 状态管理：`Zustand`
  - 仅维护 `PageConfig` 单一状态源，禁止并行状态源。
- 渲染层：纯函数 `Renderer`
  - 以 `SectionKind` 分发渲染，遵循 `UI = f(PageConfig)`。
- 导出方案：`ReactDOMServer.renderToStaticMarkup` + 构建期注入配置
  - 复用同一 Renderer，保证预览与导出一致。
- 测试体系：`Vitest + Testing Library + Playwright`
  - 覆盖 Schema、Renderer、预览导出一致性。
- 工程质量：`ESLint + Prettier + Husky + lint-staged + Commitlint`
  - 统一代码风格，强制提交前检查与规范化 commit。
- 部署平台：`GitHub Pages`
  - 静态站点统一部署到 GitHub Pages，产物来自构建后的前端静态文件。

## 分阶段实现目标
1. Phase 1（核心骨架）
- 建立 `PageConfig` 类型与 Schema v1。
- 实现 Renderer 主分发器与 5 类 Section 最小渲染。
- 实现只读 Preview。

2. Phase 2（编辑能力）
- 实现 Panel 对 `meta/theme/nav/hero/sections` 的结构化编辑。
- 所有编辑行为统一收敛为 `setPageConfig(newConfig)`。
- 确保核心编辑流程可全程通过表单控件完成，JSON 仅作为高级可选入口而非必需路径。

3. Phase 3（导出与一致性）
- 实现单页 HTML 离线导出。
- 建立“同配置下预览与导出视觉一致”校验。

4. Phase 4（质量与协作）
- 接入 lint/test/commit hooks。
- 落实“每次修改必须提交 commit”的流程。
- 接入 GitHub Actions 自动构建并发布到 GitHub Pages。

## 建议目录映射
- `src/schema/`：Schema 与默认值逻辑
- `src/renderer/`：Renderer 与 Section 渲染器
- `src/panel/`：结构化编辑面板
- `src/preview/`：只读预览
- `src/export/`：导出链路
- `src/theme/`：主题 token 映射
- `test/unit/`、`test/integration/`、`test/e2e/`
- `assets/static/`：静态资源（样式、脚本）
- `assets/templates/`：模板入口与配置模板（供静态复用与二次生成）
