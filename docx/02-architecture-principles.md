# 02 架构与原则

## 概述
系统采用单向数据流：

`Panel（Editor） -> PageConfig（Schema 校验/默认值） -> Renderer（纯函数） -> Preview（只读）`

核心目标是以配置为中心，确保预览与导出行为一致、可复现、可维护。

## 功能与职责
- Config-Centric：`PageConfig` 是唯一事实来源。
- Renderer 纯函数：`UI = f(PageConfig)`，无副作用，不区分预览态/导出态。
- Editor/Preview 解耦：Editor 只修改配置，Preview 只展示结果。
- Schema 优先：Schema 同时定义数据合法性、Panel 边界和 Renderer 输入契约。

## 不可违反约束
- 禁止从 DOM 或组件内部状态反推配置。
- 禁止在 Renderer 中使用编辑态逻辑（如 `if (isEditing)`）。
- 禁止编辑逻辑直接侵入 Preview 或导出链路。

## 架构声明
系统稳定性来自“Schema 边界清晰、职责分离、纯函数渲染”。当实现与本模块冲突时，必须修改实现以满足本模块。
