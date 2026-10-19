import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Button } from "../components/ui/button";

test("button renders children", () => {
  render(<Button>Run</Button>);
  expect(screen.getByText("Run")).toBeInTheDocument();
});
