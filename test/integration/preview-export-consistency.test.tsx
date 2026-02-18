import { JSDOM } from "jsdom";
import { createExportHtml, renderRendererMarkup } from "../../src/export/exportPage";
import { createDefaultPageConfig } from "../../src/schema/pageConfig";

describe("preview/export consistency", () => {
  it("keeps key structure counts consistent", () => {
    const config = createDefaultPageConfig();
    const previewMarkup = renderRendererMarkup(config);
    const exportHtml = createExportHtml(config);

    const previewDom = new JSDOM(`<body>${previewMarkup}</body>`);
    const exportDom = new JSDOM(exportHtml);

    const selectors = [
      ".render-root",
      ".render-topbar",
      ".render-hero",
      ".render-section",
      ".hero-gallery",
      ".media-card",
      ".narrative-card"
    ];

    for (const selector of selectors) {
      const previewCount = previewDom.window.document.querySelectorAll(selector).length;
      const exportCount = exportDom.window.document.querySelectorAll(selector).length;
      expect(exportCount).toBe(previewCount);
    }

    const previewNavCount = previewDom.window.document.querySelectorAll(".render-topbar nav a").length;
    const exportNavCount = exportDom.window.document.querySelectorAll(".render-topbar nav a").length;
    expect(exportNavCount).toBe(previewNavCount);
  });
});
