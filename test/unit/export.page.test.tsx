import { createDefaultPageConfig } from "../../src/schema/pageConfig";
import { createExportHtml, renderRendererMarkup } from "../../src/export/exportPage";

describe("export html", () => {
  it("creates a full standalone html document", () => {
    const config = createDefaultPageConfig();
    const html = createExportHtml(config);

    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain('<html lang="zh-CN">');
    expect(html).toContain(`<title>${config.meta.title}</title>`);
    expect(html).toContain("<style>");
    expect(html).toContain("render-root");
    expect(html).toContain("media-open-trigger");
    expect(html).toContain("window.addEventListener(\"scroll\", onScroll");
    expect(html).toContain("IntersectionObserver");
    expect(html).toContain("document.querySelectorAll(\".media-open-trigger\")");
    expect(html).not.toContain("modal.innerHTML");
  });

  it("keeps renderer markup consistent between preview and export", () => {
    const config = createDefaultPageConfig();
    const previewMarkup = renderRendererMarkup(config);
    const html = createExportHtml(config);

    expect(html).toContain(previewMarkup);
  });


  it("sanitizes potentially dangerous footer links", () => {
    const config = createDefaultPageConfig();
    config.footer.links[0].href = "javascript:alert('xss')";

    const markup = renderRendererMarkup(config);
    expect(markup).toContain('href="#"');
    expect(markup).not.toContain("javascript:alert");
  });

  it("does not force section visibility in exported initial markup", () => {
    const config = createDefaultPageConfig();
    const markup = renderRendererMarkup(config);
    expect(markup.includes("section-anim visible")).toBe(false);
  });
});
