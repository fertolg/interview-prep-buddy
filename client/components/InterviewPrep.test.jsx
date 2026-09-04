import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("ace-builds/src-noconflict/mode-python", () => ({}));
vi.mock("ace-builds/src-noconflict/theme-solarized_dark", () => ({}));

vi.mock("react-ace", () => ({
  default: ({ value, onChange, placeholder }) => (
    <textarea
      aria-label="editor"
      placeholder={placeholder}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

import { InterviewPrep } from "./InterviewPrep";

describe("InterviewPrep", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the first problem by default", () => {
    render(<InterviewPrep />);

    expect(
      screen.getByText(/check if a string is a palindrome/i),
    ).toBeInTheDocument();
  });

  it("disables 'Check your answer' until code is entered", async () => {
    render(<InterviewPrep />);
    const checkButton = screen.getByRole("button", {
      name: /check your answer/i,
    });

    expect(checkButton).toBeDisabled();

    await userEvent.type(screen.getByLabelText("editor"), "def solve(): pass");

    expect(checkButton).toBeEnabled();
  });

  it("randomizes the problem and clears the answer", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.25); // -> index 2

    render(<InterviewPrep />);

    await userEvent.type(screen.getByLabelText("editor"), "some code");
    await userEvent.click(
      screen.getByRole("button", { name: /randomize problem/i }),
    );

    expect(
      screen.getByText(/find the largest element in a list/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("editor")).toHaveValue("");
  });

  it("submits the problem and code, then shows the markdown result", async () => {
    fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("**Nice job!**"),
    });

    render(<InterviewPrep />);
    await userEvent.type(screen.getByLabelText("editor"), "def solve(): pass");
    await userEvent.click(
      screen.getByRole("button", { name: /check your answer/i }),
    );

    await waitFor(() =>
      expect(screen.getByText("Nice job!")).toBeInTheDocument(),
    );
  });

  it("shows the response status text when the request fails", async () => {
    fetch.mockResolvedValue({
      ok: false,
      statusText: "Internal Server Error",
    });

    render(<InterviewPrep />);
    await userEvent.type(screen.getByLabelText("editor"), "def solve(): pass");
    await userEvent.click(
      screen.getByRole("button", { name: /check your answer/i }),
    );

    await waitFor(() =>
      expect(screen.getByText("Internal Server Error")).toBeInTheDocument(),
    );
  });
});
