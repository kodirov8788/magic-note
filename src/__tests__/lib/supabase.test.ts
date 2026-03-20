import { createClient } from "@/lib/supabase/client";

// Mock the Supabase client
jest.mock("@supabase/ssr", () => ({
  createBrowserClient: jest.fn(),
}));

describe("Supabase Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it("creates client with valid environment variables", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    const { createBrowserClient } = require("@supabase/ssr");
    createBrowserClient.mockReturnValue({});

    expect(() => createClient()).not.toThrow();
    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-anon-key",
      expect.objectContaining({
        auth: expect.objectContaining({
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        }),
      })
    );
  });

  it("uses placeholder values during test runs when NEXT_PUBLIC_SUPABASE_URL is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
    const { createBrowserClient } = require("@supabase/ssr");
    createBrowserClient.mockReturnValue({});

    expect(() => createClient()).not.toThrow();
    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://placeholder.supabase.co",
      "test-anon-key",
      expect.any(Object)
    );
  });

  it("uses placeholder values during test runs when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    const { createBrowserClient } = require("@supabase/ssr");
    createBrowserClient.mockReturnValue({});

    expect(() => createClient()).not.toThrow();
    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "placeholder-anon-key",
      expect.any(Object)
    );
  });

  it("uses placeholder values during test runs when both environment variables are missing", () => {
    const { createBrowserClient } = require("@supabase/ssr");
    createBrowserClient.mockReturnValue({});

    expect(() => createClient()).not.toThrow();
    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://placeholder.supabase.co",
      "placeholder-anon-key",
      expect.any(Object)
    );
  });

  it("uses placeholder values during test runs when environment variables are empty strings", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";
    const { createBrowserClient } = require("@supabase/ssr");
    createBrowserClient.mockReturnValue({});

    expect(() => createClient()).not.toThrow();
    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://placeholder.supabase.co",
      "placeholder-anon-key",
      expect.any(Object)
    );
  });
});
