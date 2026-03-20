import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createClient } from "@/lib/supabase/client";
import LoginPage from "@/app/auth/login/page";

// Mock Supabase client
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
    },
  })),
}));

const mockSupabase = {
  auth: {
    signInWithPassword: jest.fn(),
  },
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);

// Mock Next.js router
const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe("Authentication Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Login Page", () => {
    it("renders login form", () => {
      render(<LoginPage />);

      expect(screen.getAllByText("Sign In").length).toBeGreaterThan(0);
      expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
      expect(
        screen.getByText("Enter your email and password to access your notes")
      ).toBeInTheDocument();
    });

    it("submits form with valid credentials", async () => {
      const user = userEvent.setup();
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: "test-user-id" } },
        error: null,
      });

      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText("Email");
      const passwordInput = screen.getByPlaceholderText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign In" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      });

      expect(mockPush).toHaveBeenCalledWith("/");
      expect(mockRefresh).toHaveBeenCalled();
    });

    it("displays error message on failed login", async () => {
      const user = userEvent.setup();
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: "Invalid credentials" },
      });

      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText("Email");
      const passwordInput = screen.getByPlaceholderText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign In" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();
      // Mock a delayed response
      mockSupabase.auth.signInWithPassword.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: { user: { id: "test-user-id" } },
                  error: null,
                }),
              100
            )
          )
      );

      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText("Email");
      const passwordInput = screen.getByPlaceholderText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign In" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      expect(screen.getByText("Signing in...")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it("validates required fields", async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const submitButton = screen.getByRole("button", { name: "Sign In" });
      await user.click(submitButton);

      // HTML5 validation should prevent submission
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("handles unexpected errors", async () => {
      const user = userEvent.setup();
      mockSupabase.auth.signInWithPassword.mockRejectedValue(
        new Error("Network error")
      );

      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText("Email");
      const passwordInput = screen.getByPlaceholderText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign In" });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("An unexpected error occurred")
        ).toBeInTheDocument();
      });
    });
  });
});
