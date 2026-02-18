import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "../../src/App";

describe("App", () => {
  it("renders editor and preview shells", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "编辑面板" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Preview" })).toBeInTheDocument();
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
    fireEvent.change(heroTitleInput, { target: { value: "第一次修改" } });
    fireEvent.change(heroTitleInput, { target: { value: "第二次修改" } });
    expect(heroTitleInput.value).toBe("第二次修改");

    fireEvent.click(screen.getByRole("button", { name: "撤销" }));
    expect(heroTitleInput.value).toBe("第一次修改");

    fireEvent.click(screen.getByRole("button", { name: "重做" }));
    expect(heroTitleInput.value).toBe("第二次修改");
  });
});
