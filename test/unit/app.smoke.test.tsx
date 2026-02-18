import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "../../src/App";

describe("App", () => {
  it("renders editor and preview shells", () => {
    render(<App />);

    expect(screen.getByText("WebEditor")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "编辑面板" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Preview" })).toBeInTheDocument();
    expect(screen.getByText("WebEditor · 面向零代码用户的可视化建站编辑器")).toBeInTheDocument();
  });

  it("supports unified theme switch and persists selection", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "暗色" }));

    expect(screen.getByRole("button", { name: "暗色" })).toHaveAttribute("aria-pressed", "true");
    expect(window.localStorage.getItem("editor_ui_theme")).toBe("dark");
  });

  it("updates preview only after clicking save", () => {
    render(<App />);

    const heroTitleInput = screen.getByLabelText("主标题");
    fireEvent.change(heroTitleInput, { target: { value: "新的主标题" } });

    expect(screen.getByText("Schema 驱动页面生成")).toBeInTheDocument();
    expect(screen.queryByText("新的主标题")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "保存更改" }));

    expect(screen.getByText("新的主标题")).toBeInTheDocument();
  });

  it("supports undo and redo for draft edits", () => {
    render(<App />);

    const heroTitleInput = screen.getByLabelText("主标题") as HTMLInputElement;
    const originalValue = heroTitleInput.value;
    fireEvent.change(heroTitleInput, { target: { value: "第一次修改" } });
    fireEvent.change(heroTitleInput, { target: { value: "第二次修改" } });
    expect(heroTitleInput.value).toBe("第二次修改");

    fireEvent.click(screen.getByRole("button", { name: "撤销" }));
    expect(heroTitleInput.value).toBe(originalValue);

    fireEvent.click(screen.getByRole("button", { name: "重做" }));
    expect(heroTitleInput.value).toBe("第二次修改");
  });

  it("builds nav automatically and respects include-in-nav + custom label", () => {
    render(<App />);

    const navLabelInputs = screen.getAllByLabelText("导航显示文字（可选）") as HTMLInputElement[];
    fireEvent.change(navLabelInputs[1], { target: { value: "我的条带" } });

    const includeNavChecks = screen.getAllByLabelText("加入导航栏") as HTMLInputElement[];
    fireEvent.click(includeNavChecks[0]);

    fireEvent.click(screen.getByRole("button", { name: "保存更改" }));

    expect(screen.queryByRole("link", { name: "01 项目叙述" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "01 我的条带" })).toBeInTheDocument();
  });

  it("supports keyboard section reorder with alt+arrow keys", () => {
    render(<App />);

    const sectionTitlesBefore = Array.from(document.querySelectorAll(".section-editor .section-title")).map((node) =>
      node.textContent?.trim()
    );
    const firstSectionTitle = screen.getByText("01 项目叙述 · 图文叙述");
    const firstSectionEditor = firstSectionTitle.closest("details");
    expect(firstSectionEditor).not.toBeNull();

    fireEvent.focus(firstSectionEditor as HTMLElement);
    fireEvent.keyDown(firstSectionEditor as HTMLElement, { key: "ArrowDown", altKey: true });
    const sectionTitlesAfter = Array.from(document.querySelectorAll(".section-editor .section-title")).map((node) =>
      node.textContent?.trim()
    );
    expect(sectionTitlesAfter[0]).not.toBe(sectionTitlesBefore[0]);
  });

  it("supports section reorder with move buttons", () => {
    render(<App />);

    const sectionTitlesBefore = Array.from(document.querySelectorAll(".section-editor .section-title")).map((node) =>
      node.textContent?.trim()
    );

    fireEvent.click(screen.getAllByRole("button", { name: /下移区块：/ })[0]);

    const sectionTitlesAfter = Array.from(document.querySelectorAll(".section-editor .section-title")).map((node) =>
      node.textContent?.trim()
    );
    expect(sectionTitlesAfter[0]).not.toBe(sectionTitlesBefore[0]);
  });
});
