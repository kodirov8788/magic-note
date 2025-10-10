import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

  beforeEach(() => {
    jest.clearAllMocks();
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

  it("copies content to clipboard on click", async () => {
    const user = userEvent.setup();
    render(<LineCopyButton {...mockProps} />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "This is a test line"
    );
    expect(toast.success).toHaveBeenCalledWith("Line 1 copied to clipboard");
  });

  it("handles clipboard errors gracefully", async () => {
    const user = userEvent.setup();
    const mockError = new Error("Clipboard access denied");
    (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(
      mockError
    );

    render(<LineCopyButton {...mockProps} />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(toast.error).toHaveBeenCalledWith("Failed to copy line");
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
    expect(container).toHaveClass("relative flex items-center group");
  });
});
