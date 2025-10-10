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
      "test-anon-key"
    );
  });

  it("throws error when NEXT_PUBLIC_SUPABASE_URL is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

    expect(() => createClient()).toThrow(
      "Missing Supabase environment variables. Please check your .env.local file."
    );
  });

  it("throws error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";

    expect(() => createClient()).toThrow(
      "Missing Supabase environment variables. Please check your .env.local file."
    );
  });

  it("throws error when both environment variables are missing", () => {
    expect(() => createClient()).toThrow(
      "Missing Supabase environment variables. Please check your .env.local file."
    );
  });

  it("throws error when environment variables are empty strings", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";

    expect(() => createClient()).toThrow(
      "Missing Supabase environment variables. Please check your .env.local file."
    );
  });
});
