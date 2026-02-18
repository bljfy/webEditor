import { sanitizeImageSrc, sanitizeLinkHref } from "../../src/security/urlSanitizer";

describe("url sanitizer", () => {
  it("blocks javascript links and keeps safe web links", () => {
    expect(sanitizeLinkHref("javascript:alert(1)")).toBe("#");
    expect(sanitizeLinkHref("https://example.com")).toBe("https://example.com");
    expect(sanitizeLinkHref("/docs/start")).toBe("/docs/start");
  });

  it("blocks dangerous image src protocols", () => {
    expect(sanitizeImageSrc("javascript:alert(1)")).toBe("");
    expect(sanitizeImageSrc("data:image/png;base64,abc")).toBe("data:image/png;base64,abc");
    expect(sanitizeImageSrc("https://cdn.example.com/a.png")).toBe("https://cdn.example.com/a.png");
  });
});
