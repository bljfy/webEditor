import { renderToStaticMarkup } from "react-dom/server";
import { Renderer } from "../renderer/Renderer";
import type { PageConfig } from "../schema/pageConfig";

const EXPORT_RENDERER_CSS = `
:root {
  color-scheme: light;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  background: #eef3fb;
  color: #10213a;
  line-height: 1.6;
}
.render-root {
  --ink: #10213a;
  --muted: #5e708d;
  --line: #d8e2f0;
  --panel: #ffffff;
  --bg: #f3f6fb;
  --accent: #1f6feb;
  --radius: 12px;
  max-width: 1120px;
  margin: 16px auto;
  color: var(--ink);
  background: var(--bg);
  padding: 8px;
  border-radius: 10px;
}
.render-root[data-theme="dark"] {
  --ink: #e7f0ff;
  --muted: #93a8c9;
  --line: #1f3553;
  --panel: #0d1b2d;
  --bg: #06111e;
}
.render-topbar, .render-hero, .render-section {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--panel);
}
.render-topbar {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
}
.render-topbar nav {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.render-topbar a {
  color: var(--muted);
  text-decoration: none;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 12px;
}
.render-hero {
  margin-top: 10px;
  padding: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.hero-eyebrow { color: var(--accent); font-size: 12px; }
.render-hero h2 { margin: 6px 0; }
.render-hero p { margin: 0; color: var(--muted); }
.hero-stats {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.hero-stats article {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 6px;
}
.hero-stats strong { display: block; }
.hero-gallery {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 6px;
}
.hero-main { grid-row: span 2; }
.hero-main, .hero-sub {
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
}
.hero-gallery img, .media-card img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
.render-section { margin-top: 10px; padding: 10px; }
.render-section header h3 { margin: 0; }
.render-section header p { margin: 2px 0 8px; color: var(--muted); }
.section-grid { display: grid; gap: 8px; }
.section-grid-narrative { grid-template-columns: repeat(3, 1fr); }
.section-grid-strip {
  grid-auto-flow: column;
  grid-auto-columns: minmax(220px, 1fr);
  overflow-x: auto;
}
.section-grid-model { grid-template-columns: 1.2fr 1fr; }
.model-secondary-grid { display: grid; gap: 8px; }
.section-grid-atlas { grid-template-columns: 1.2fr 1fr 1fr; }
.section-grid-masonry { columns: 3 200px; }
.section-grid-masonry .media-card { margin-bottom: 8px; break-inside: avoid; }
.narrative-card, .media-card {
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
  background: var(--panel);
}
.narrative-card { padding: 10px; }
.narrative-card h4, .media-body h4 { margin: 0 0 4px; }
.narrative-card p, .media-body p { margin: 0; color: var(--muted); font-size: 13px; }
.media-placeholder {
  min-height: 140px;
  display: grid;
  place-items: center;
  color: var(--muted);
  background: repeating-linear-gradient(-45deg, #eef3fb, #eef3fb 10px, #f7faff 10px, #f7faff 20px);
}
.media-body { padding: 8px; }
@media (max-width: 920px) {
  .render-hero,
  .section-grid-narrative,
  .section-grid-model,
  .section-grid-atlas {
    grid-template-columns: 1fr;
  }
  .hero-main { grid-row: auto; }
}
`;

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeFileName(title: string): string {
  const clean = title.trim().replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]+/g, "-").replace(/-+/g, "-");
  return clean || "page";
}

export function renderRendererMarkup(config: PageConfig): string {
  return renderToStaticMarkup(<Renderer config={config} />);
}

export function createExportHtml(config: PageConfig): string {
  const title = config.meta.title || "未命名页面";
  const description = config.meta.description || "";
  const language = config.meta.language || "zh-CN";
  const markup = renderRendererMarkup(config);

  return [
    "<!doctype html>",
    `<html lang="${escapeHtml(language)}">`,
    "<head>",
    "<meta charset=\"UTF-8\" />",
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />",
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<style>${EXPORT_RENDERER_CSS}</style>`,
    "</head>",
    `<body>${markup}</body>`,
    "</html>"
  ].join("");
}

export function exportPageAsHtmlFile(config: PageConfig): void {
  const html = createExportHtml(config);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${normalizeFileName(config.meta.title)}.html`;
  link.click();
  URL.revokeObjectURL(url);
}
