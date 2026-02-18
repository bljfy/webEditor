# 04 Editor（Panel）规范

## 概述
Panel 是 Schema 的可视化实例化工具，只负责编辑配置，不负责布局渲染与 DOM 操作。

## 功能与职责
- 以“零代码可操作”为首要目标，禁止将关键编辑能力仅通过 JSON/代码输入暴露给用户。
- 仅生成 Schema 允许的字段和值。
- 所有操作最终可归约为 `setPageConfig(newConfig)`。
- 提供结构化编辑入口，降低用户直接操作 JSON 的成本。

## 实施要求
- 不直接操作 Preview DOM。
- 不维护与 `PageConfig` 并行的“第二状态源”。
- 字段校验失败时给出明确错误并阻断非法写入。
- 关键内容（meta/theme/nav/hero/sections）的新增、删除、排序、修改必须提供表单化控件，不要求用户理解 JSON 结构。
