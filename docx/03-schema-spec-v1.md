# 03 Schema v1 规范

## 概述
`PageConfig` 是系统唯一页面输入。页面结构、内容、顺序必须全部来自配置，不允许隐式推断。

## 功能与职责
- 统一输入契约，保障渲染稳定。
- 限制可编辑字段，避免无约束扩展。
- 为校验、默认值填充、预览与导出复用提供标准结构。

## 顶层结构
- `meta: PageMeta`
- `theme: ThemeConfig`
- `nav: NavConfig`
- `hero: HeroSection`
- `sections: Section[]`

## 字段规范
### PageMeta
- `title: string`（必填）页面标题/导出标题
- `description: string`（可选）页面描述
- `language: "zh-CN" | "en"`（必填，默认 `zh-CN`）

### ThemeConfig
- `background: "dark" | "light"`（必填）
- `accentColor: string`（可选）
- `radius: "sm" | "md" | "lg"`（可选）

### NavConfig
- `brand: string`（必填）
- `items: NavItem[]`（必填）

`NavItem`：
- `id: string`（必填，对应 `section.id`）
- `label: string`（必填）

### HeroSection
- `eyebrow: string`（可选）
- `title: string`（必填）
- `lead: string`（必填）
- `stats: HeroStat[]`（可选）
- `gallery: HeroGalleryItem[]`（必填）

`HeroStat`：`value: string`、`label: string`（均必填）

`HeroGalleryItem`：
- `role: "main" | "secondary"`（必填）
- `image: ImageAsset`（必填）

### Section（通用外壳）
- `id: string`（必填，唯一）
- `kind: SectionKind`（必填）
- `title: string`（必填）
- `subtitle: string`（可选）
- `content: object`（必填）

`SectionKind`（v1）：
- `narrative`
- `strip-gallery`
- `model-stage`
- `atlas-grid`
- `masonry-gallery`

### 各 kind 内容结构
- `narrative.content.cards: { title: string; text: string }[]`
- `strip-gallery.content.items: { image: ImageAsset; tags?: string[] }[]`
- `model-stage.content.main: { image: ImageAsset; tags?: string[] }`
- `model-stage.content.secondary?: { image: ImageAsset; tags?: string[] }[]`
- `atlas-grid.content.items: { image?: ImageAsset; placeholder?: boolean; tags?: string[] }[]`
- `masonry-gallery.content.items: { image: ImageAsset; tags?: string[] }[]`

### ImageAsset（全局复用）
- `src: string`（必填）
- `title: string`（可选）
- `note: string`（可选）

## 语言与文案要求
- 网站默认语言为中文（简体）。
- 在多语言场景中，中文必须作为默认值和回退值。
