# Agent 模块化设计指南

本文档为主入口（Index）。系统规范由 `docx/` 子文档共同构成。

## 仓库目录架构
- `docx/`：设计与规范文档（架构、Schema、编辑/预览/导出、编码规范）。
- `src/`：业务源码与渲染实现。
- `test/`：自动化测试与回归用例。

推荐扩展目录：
- `assets/`：静态资源（图片、样例数据）。
- `scripts/`：开发与构建脚本。

当前模板资源约定：
- `assets/static/`：站点静态资源（`css/`、`js/`）。
- `assets/templates/`：模板文件与模板配置（如 `index.template.html`、`page-config.template.json`）。

## 文档目标
- 统一系统边界：Schema 驱动、配置中心化、纯函数渲染。
- 用模块化文档管理规则，降低实现偏差。
- 让开发、测试、评审都能按同一套契约执行。

## 模块目录（总览 + 功能）
- `docx/01-system-positioning.md`
  - 概述：系统定位、目标与非目标。
  - 功能：定义“要做什么/不做什么”的产品边界。
- `docx/02-architecture-principles.md`
  - 概述：总体架构与不可违反原则。
  - 功能：约束数据流、职责分离与 Renderer 纯函数行为。
- `docx/03-schema-spec-v1.md`
  - 概述：PageConfig 与各子结构的 v1 规范。
  - 功能：作为 Editor 输入边界与 Renderer 输入契约。
- `docx/04-editor-panel-spec.md`
  - 概述：Panel 的职责和交互边界。
  - 功能：确保所有编辑行为可归约为配置写入。
- `docx/05-preview-spec.md`
  - 概述：Preview 的只读与视觉等价要求。
  - 功能：保证预览与最终导出页面一致。
- `docx/06-export-spec.md`
  - 概述：导出链路与实现原则。
  - 功能：规范 `PageConfig -> Renderer -> HTML` 的稳定产物生成。
- `docx/07-evolution-strategy.md`
  - 概述：可扩展项与禁止项。
  - 功能：控制版本演进，避免架构退化。
- `docx/08-coding-standards.md`
  - 概述：编码规范与提交流程。
  - 功能：统一风格与质量门槛，并强制每次修改提交 commit。
- `docx/09-tech-stack-and-goals.md`
  - 概述：技术栈方案与分阶段实现目标。
  - 功能：将架构约束转化为可执行落地计划。

## 语言与内容规范
- 网站默认语言必须为中文（简体），配置中默认 `meta.language = zh-CN`。
- 页面文案（导航、按钮、提示、错误信息）默认中文；如扩展多语言，中文仍为默认值。
- 站点部署平台统一为 GitHub Pages。

## 阅读顺序建议
1. `docx/01-system-positioning.md`
2. `docx/02-architecture-principles.md`
3. `docx/03-schema-spec-v1.md`
4. `docx/04-editor-panel-spec.md`
5. `docx/05-preview-spec.md`
6. `docx/06-export-spec.md`
7. `docx/07-evolution-strategy.md`
8. `docx/08-coding-standards.md`
9. `docx/09-tech-stack-and-goals.md`

## 维护规则
- 任何实现与 `docx/` 子文档冲突时，必须以子文档规范为准并修改实现。
- 新增 SectionKind 时，必须同步更新 Schema 文档和对应 Renderer 说明。
- 禁止在 Renderer 中引入编辑态分支（如 `isEditing`）。
- 每次代码改动后必须执行对应测试（至少 `npm run lint` 与 `npm run test`，必要时执行 `npm run build`）并修复失败项。
- 每次修改必须提交 commit，禁止长期保留未提交变更。
