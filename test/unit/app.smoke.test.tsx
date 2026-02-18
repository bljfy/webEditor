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

    const brandInput = screen.getByLabelText("品牌名");
    fireEvent.change(brandInput, { target: { value: "新品牌" } });

    expect(screen.getByText("ARCH TEMPLATE")).toBeInTheDocument();
    expect(screen.queryByText("新品牌")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "保存更改" }));

    expect(screen.getByText("新品牌")).toBeInTheDocument();
  });

  it("supports undo and redo for draft edits", () => {
    render(<App />);

    const brandInput = screen.getByLabelText("品牌名") as HTMLInputElement;
    fireEvent.change(brandInput, { target: { value: "第一次修改" } });
    fireEvent.change(brandInput, { target: { value: "第二次修改" } });
    expect(brandInput.value).toBe("第二次修改");

    fireEvent.click(screen.getByRole("button", { name: "撤销" }));
    expect(brandInput.value).toBe("第一次修改");

    fireEvent.click(screen.getByRole("button", { name: "重做" }));
    expect(brandInput.value).toBe("第二次修改");
  });
});
