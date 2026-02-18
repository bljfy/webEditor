import { resolveScrollablePreviewShell } from "../../src/renderer/scrollContext";

describe("renderer scroll context", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("uses preview shell when it is actually scrollable", () => {
    const shell = document.createElement("section");
    shell.className = "preview-shell";
    shell.style.overflowY = "auto";
    const root = document.createElement("div");
    shell.appendChild(root);
    document.body.appendChild(shell);

    Object.defineProperty(shell, "clientHeight", { value: 300, configurable: true });
    Object.defineProperty(shell, "scrollHeight", { value: 900, configurable: true });

    expect(resolveScrollablePreviewShell(root)).toBe(shell);
  });

  it("falls back to window when preview shell is not scrollable", () => {
    const shell = document.createElement("section");
    shell.className = "preview-shell";
    shell.style.overflowY = "visible";
    const root = document.createElement("div");
    shell.appendChild(root);
    document.body.appendChild(shell);

    Object.defineProperty(shell, "clientHeight", { value: 900, configurable: true });
    Object.defineProperty(shell, "scrollHeight", { value: 900, configurable: true });

    expect(resolveScrollablePreviewShell(root)).toBeNull();
  });
});
