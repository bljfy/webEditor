# Schema 驱动页面编辑器

面向不懂代码用户的可视化页面编辑器。通过 `Panel` 生成 `PageConfig`，由纯函数 `Renderer` 渲染预览，确保配置与展示一致。

## 项目目标
- 零代码可用：核心编辑能力必须通过表单完成。
- 配置中心化：`PageConfig` 是唯一事实来源。
- 预览一致：预览与后续导出必须复用同一渲染逻辑。

## 技术栈
- `React + TypeScript + Vite`
- `Zod`（Schema 校验）
- `Zustand`（单一状态源）
- `Vitest + Testing Library`

## 当前功能
- 结构化编辑：`meta/theme/nav/hero/sections`
- 5 类区块编辑：`narrative`、`strip-gallery`、`model-stage`、`atlas-grid`、`masonry-gallery`
- 可折叠表单：主分组与区块子项均可折叠
- 草稿保存流：先编辑，点击“保存更改”后才校验并刷新预览
- 中文校验报错：错误信息包含中文字段路径（含数组第 N 项）
- 双滚动布局：`Panel` 常驻可见，`Preview` 独立滚动
- 导出功能：一键导出离线单页 HTML（复用 Renderer）

## 快速开始
### 1) 安装依赖
```bash
npm install
```

### 2) 启动开发
```bash
npm run dev
```

### 3) 运行检查
```bash
npm run lint
npm run test
npm run build
```

## 常用脚本
- `npm run dev`：本地开发
- `npm run lint`：静态检查
- `npm run test`：单元测试
- `npm run build`：类型检查 + 生产构建
- `npm run preview`：预览构建产物

## 目录结构
```text
src/
  panel/       # 编辑面板
  preview/     # 预览容器
  renderer/    # 纯函数渲染逻辑
  schema/      # PageConfig schema 与默认值
  store/       # Zustand 状态管理
test/
  unit/        # 单元测试
docx/
  01-10 *.md   # 架构规范、实施目标、修改日志
```

## 核心交互说明
- 编辑时不会实时打断输入（允许临时空值）。
- 只有点击“保存更改”才会：
  1. 触发 Schema 校验
  2. 更新预览页面
- 校验失败时在 Panel 顶部显示中文错误定位。

## 规范与协作
- 规范入口：`agent.md`
- 架构与产品规范：`docx/01-system-positioning.md` 到 `docx/09-tech-stack-and-goals.md`
- 修改日志（强制维护）：`docx/10-change-log.md`

必须遵守：
- 每次代码改动至少执行 `npm run lint` 与 `npm run test`（必要时 `npm run build`）
- 每次修改必须提交 commit
- 每次功能改动必须更新 `docx/10-change-log.md`

## 已知技术负债
- 预览与导出一致性目前为结构一致性校验，尚未覆盖像素级视觉回归。
- e2e 测试与 CI/CD（GitHub Pages）尚未接入。
- 可继续增强：未保存离开提醒、撤销/重做、区块拖拽排序。
