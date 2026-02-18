import { renderToStaticMarkup } from "react-dom/server";
import { Renderer } from "../renderer/Renderer";
import { RENDERER_SHARED_CSS } from "../renderer/rendererSharedStyles";
import type { PageConfig } from "../schema/pageConfig";

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
  const markup = renderToStaticMarkup(<Renderer config={config} />);
  return markup
    .replaceAll("section-anim ", "section-anim visible ")
    .replaceAll("section-anim\"", "section-anim visible\"");
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
    `<style>:root{color-scheme:light;}*{box-sizing:border-box;}html,body{margin:0;padding:0;}body{font-family:"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif;background:#eef3fb;color:#10213a;line-height:1.6;}${RENDERER_SHARED_CSS}</style>`,
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
