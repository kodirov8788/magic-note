import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FolderDialog from "@/components/folders/FolderDialog";
import { createClient } from "@/lib/supabase/client";

const createFolderQuery = () => ({
  insert: jest.fn().mockResolvedValue({
    data: { id: "test-folder-id", name: "Test Folder" },
    error: null,
  }),
  update: jest.fn().mockResolvedValue({ error: null }),
  eq: jest.fn().mockReturnThis(),
});

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(),
};

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => mockSupabase),
}));

(createClient as jest.Mock).mockReturnValue(mockSupabase);

describe("FolderDialog", () => {
  const mockProps = {
    open: true,
    onOpenChange: jest.fn(),
    onFolderCreated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.from.mockReturnValue(createFolderQuery());
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "test-user-id" } },
    });
  });

  it("renders dialog when open", () => {
    render(<FolderDialog {...mockProps} />);

    expect(screen.getByText("Create New Folder")).toBeInTheDocument();
    expect(
      screen.getByText("Enter a name for your new folder.")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Folder name")).toBeInTheDocument();
  });

  it("does not render dialog when closed", () => {
    render(<FolderDialog {...mockProps} open={false} />);

    expect(screen.queryByText("Create New Folder")).not.toBeInTheDocument();
  });

  it("submits form with valid folder name", async () => {
    const user = userEvent.setup();
    render(<FolderDialog {...mockProps} />);

    const input = screen.getByPlaceholderText("Folder name");
    const submitButton = screen.getByRole("button", { name: "Create Folder" });

    await user.type(input, "My Test Folder");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("folders");
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        name: "My Test Folder",
        user_id: "test-user-id",
      });
    });

    expect(mockProps.onFolderCreated).toHaveBeenCalled();
  });

  it("does not submit form with empty folder name", async () => {
    render(<FolderDialog {...mockProps} />);
    expect(
      screen.getByRole("button", { name: "Create Folder" })
    ).toBeDisabled();
    expect(mockSupabase.from().insert).not.toHaveBeenCalled();
  });

  it("handles form submission errors", async () => {
    const user = userEvent.setup();
    mockSupabase.from.mockReturnValueOnce({
      ...createFolderQuery(),
      insert: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      }),
    });

    render(<FolderDialog {...mockProps} />);

    await user.type(screen.getByPlaceholderText("Folder name"), "Test Folder");
    await user.click(screen.getByRole("button", { name: "Create Folder" }));

    await waitFor(() => {
      expect(screen.getByText("Database error")).toBeInTheDocument();
    });
  });

  it("handles authentication errors", async () => {
    const user = userEvent.setup();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
    });

    render(<FolderDialog {...mockProps} />);

    await user.type(screen.getByPlaceholderText("Folder name"), "Test Folder");
    await user.click(screen.getByRole("button", { name: "Create Folder" }));

    await waitFor(() => {
      expect(
        screen.getByText("You must be logged in to manage folders")
      ).toBeInTheDocument();
    });
  });

  it("cancels dialog and resets form", async () => {
    const user = userEvent.setup();
    render(<FolderDialog {...mockProps} />);

    await user.type(screen.getByPlaceholderText("Folder name"), "Test Folder");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("trims whitespace from folder name", async () => {
    const user = userEvent.setup();
    render(<FolderDialog {...mockProps} />);

    await user.type(screen.getByPlaceholderText("Folder name"), "  Test Folder  ");
    await user.click(screen.getByRole("button", { name: "Create Folder" }));

    await waitFor(() => {
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        name: "Test Folder",
        user_id: "test-user-id",
      });
    });
  });
});
