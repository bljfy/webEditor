import { render, screen } from "@testing-library/react";
import { App } from "../../src/App";

describe("App", () => {
  it("renders bootstrap title", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Schema 驱动页面系统" })).toBeInTheDocument();
  });
});
