import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Contact Manager header", () => {
  render(<App />);
  const title = screen.getByText(/Contact Manager/i);
  expect(title).toBeInTheDocument();
});
