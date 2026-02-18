import { renderToStaticMarkup } from "react-dom/server";
import { Renderer } from "../renderer/Renderer";
import { RENDERER_SHARED_CSS } from "../renderer/rendererSharedStyles";
import type { PageConfig } from "../schema/pageConfig";

const EXPORT_INTERACTION_SCRIPT = `
(() => {
  const root = document.querySelector(".render-root");
  if (!root) return;

  const navLinks = Array.from(document.querySelectorAll(".render-nav-link"));
  const sections = Array.from(document.querySelectorAll(".render-section"));
  const getIdFromHref = (href) => (href && href.startsWith("#") ? href.slice(1) : "");

  const setActiveNav = (id) => {
    navLinks.forEach((link) => {
      const linkId = getIdFromHref(link.getAttribute("href") || "");
      if (linkId === id) link.classList.add("active");
      else link.classList.remove("active");
    });
  };

  const onScroll = () => {
    const topOffset = 96;
    let currentId = sections[0] ? sections[0].id : "";
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top - topOffset <= 0) currentId = section.id;
    });
    if (currentId) setActiveNav(currentId);
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = getIdFromHref(link.getAttribute("href") || "");
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveNav(id);
    });
  });

  const collectViewerImages = () => {
    return Array.from(document.querySelectorAll(".media-open-trigger img"))
      .map((img) => ({
        src: img.getAttribute("src") || "",
        title: img.getAttribute("alt") || "图片"
      }))
      .filter((item) => item.src);
  };

  const viewerImages = collectViewerImages();
  let activeImageIndex = -1;

  const removeModal = () => {
    const modal = document.querySelector(".image-modal");
    if (modal) modal.remove();
    activeImageIndex = -1;
  };

  const openModalByIndex = (index) => {
    if (!viewerImages.length) return;
    const safeIndex = (index + viewerImages.length) % viewerImages.length;
    const current = viewerImages[safeIndex];
    activeImageIndex = safeIndex;
    if (!current.src) return;
    removeModal();
    const modal = document.createElement("div");
    modal.className = "image-modal";
    modal.innerHTML = \`
      <div class="image-modal-content">
        <img src="\${current.src}" alt="\${current.title || "图片"}" />
        <div class="image-modal-bar">
          <div class="image-modal-nav">
            <button type="button" data-modal-prev>上一张</button>
            <button type="button" data-modal-next>下一张</button>
          </div>
          <span>\${current.title || "图片"}</span>
          <button type="button" data-modal-close>关闭</button>
        </div>
      </div>
    \`;
    modal.addEventListener("click", () => removeModal());
    const content = modal.querySelector(".image-modal-content");
    if (content) content.addEventListener("click", (event) => event.stopPropagation());
    const closeBtn = modal.querySelector("[data-modal-close]");
    if (closeBtn) closeBtn.addEventListener("click", () => removeModal());
    const prevBtn = modal.querySelector("[data-modal-prev]");
    if (prevBtn) prevBtn.addEventListener("click", () => openModalByIndex(activeImageIndex - 1));
    const nextBtn = modal.querySelector("[data-modal-next]");
    if (nextBtn) nextBtn.addEventListener("click", () => openModalByIndex(activeImageIndex + 1));
    document.body.appendChild(modal);
  };

  document.querySelectorAll(".media-open-trigger").forEach((trigger, index) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openModalByIndex(index);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") removeModal();
    if (event.key === "ArrowRight" && activeImageIndex >= 0) openModalByIndex(activeImageIndex + 1);
    if (event.key === "ArrowLeft" && activeImageIndex >= 0) openModalByIndex(activeImageIndex - 1);
  });

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();
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
    `<body>${markup}<script>${EXPORT_INTERACTION_SCRIPT}</script></body>`,
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
