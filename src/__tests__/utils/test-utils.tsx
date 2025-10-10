import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import type { User } from "@supabase/supabase-js";
import type { Folder, Note } from "@/types";

// Mock providers and context that might be needed
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Add a test to prevent "no tests" error
describe("Test Utils", () => {
  it("should export utilities", () => {
    expect(customRender).toBeDefined();
    expect(createMockUser).toBeDefined();
    expect(createMockFolder).toBeDefined();
    expect(createMockNote).toBeDefined();
  });
});

// Mock data factories
export const createMockUser = (overrides: Partial<User> = {}): User =>
  ({
    id: "test-user-id",
    email: "test@example.com",
    created_at: "2025-01-10T00:00:00Z",
    updated_at: "2025-01-10T00:00:00Z",
    aud: "authenticated",
    role: "authenticated",
    ...overrides,
  } as User);

export const createMockFolder = (overrides: Partial<Folder> = {}): Folder => ({
  id: "test-folder-id",
  name: "Test Folder",
  user_id: "test-user-id",
  created_at: "2025-01-10T00:00:00Z",
  updated_at: "2025-01-10T00:00:00Z",
  ...overrides,
});

export const createMockNote = (overrides: Partial<Note> = {}): Note => ({
  id: "test-note-id",
  title: "Test Note",
  content: "# Test Note\n\nThis is a test note.",
  folder_id: "test-folder-id",
  user_id: "test-user-id",
  created_at: "2025-01-10T00:00:00Z",
  updated_at: "2025-01-10T00:00:00Z",
  ...overrides,
});

// Mock Supabase responses
export const createMockSupabaseResponse = <T = unknown,>(
  data: T,
  error: Error | null = null
) => ({
  data,
  error,
});

// Mock authentication responses
export const createMockAuthResponse = (
  user: User | null,
  error: Error | null = null
) => ({
  data: { user },
  error,
});

// Mock database responses
export const createMockDatabaseResponse = <T = unknown,>(
  data: T,
  error: Error | null = null
) => ({
  data,
  error,
});

// Export everything
export * from "@testing-library/react";
export { customRender as render };
