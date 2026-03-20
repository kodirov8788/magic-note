import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LineCopyButton from "@/components/notes/LineCopyButton";
import { toast } from "sonner";

// Mock the toast module
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("LineCopyButton", () => {
  const mockProps = {
    content: "This is a test line",
    lineNumber: 1,
    className: "test-class",
  };
  let writeTextMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    writeTextMock = jest.fn(() => Promise.resolve());
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: writeTextMock,
      },
    });
  });

  it("renders without crashing", () => {
    render(<LineCopyButton {...mockProps} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows copy button on hover", async () => {
    const user = userEvent.setup();
    render(<LineCopyButton {...mockProps} />);

    const container = screen.getByRole("button").parentElement;
    expect(container).toBeInTheDocument();

    await user.hover(container!);

    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).toHaveClass("opacity-100");
    });
  });

  it("hides copy button on mouse leave", async () => {
    const user = userEvent.setup();
    render(<LineCopyButton {...mockProps} />);

    const container = screen.getByRole("button").parentElement;
    expect(container).toBeInTheDocument();

    await user.hover(container!);
    await user.unhover(container!);

    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).toHaveClass("opacity-0");
    });
  });

  it("applies custom className", () => {
    render(<LineCopyButton {...mockProps} />);
    const container = screen.getByRole("button").parentElement;
    expect(container).toHaveClass("test-class");
  });

  it("renders with default className when none provided", () => {
    const { content, lineNumber } = mockProps;
    render(<LineCopyButton content={content} lineNumber={lineNumber} />);
    const container = screen.getByRole("button").parentElement;
    expect(container).toHaveClass("relative group");
  });
});
