import { render, screen } from "@testing-library/react";
import { App } from "../../src/App";

describe("App", () => {
  it("renders editor and preview shells", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Panel" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Preview" })).toBeInTheDocument();
  });
});
