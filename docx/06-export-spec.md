# 06 导出规范

## 概述
导出链路为：`PageConfig -> Renderer -> HTML Artifact`，要求稳定、可复现、与预览一致。

## 功能与职责
- 基于配置生成离线单页 HTML。
- 避免运行时环境差异导致的结果不一致。
- 保证导出与预览视觉一致。

## 实施要求
- 不抓取运行态 DOM。
- 不在运行时拼接 HTML 字符串。
- 在构建期注入 `PageConfig`，复用 Renderer。
