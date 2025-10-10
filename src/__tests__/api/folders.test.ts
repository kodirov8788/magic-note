import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/folders/route";
import { createClient } from "@/lib/supabase/server";

// Mock Supabase server client
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  })),
}));

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
};

(createClient as jest.Mock).mockResolvedValue(mockSupabase);

describe("/api/folders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("returns folders for authenticated user", async () => {
      const mockUser = { id: "test-user-id" };
      const mockFolders = [
        { id: "folder-1", name: "Work", user_id: "test-user-id" },
        { id: "folder-2", name: "Personal", user_id: "test-user-id" },
      ];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });
      mockSupabase.from().select().eq().order().mockResolvedValue({
        data: mockFolders,
        error: null,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockFolders);
      expect(mockSupabase.from().select).toHaveBeenCalledWith("*");
      expect(mockSupabase.from().eq).toHaveBeenCalledWith(
        "user_id",
        "test-user-id"
      );
    });

    it("returns 401 for unauthenticated user", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("handles database errors", async () => {
      const mockUser = { id: "test-user-id" };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });
      mockSupabase
        .from()
        .select()
        .eq()
        .order()
        .mockResolvedValue({
          data: null,
          error: { message: "Database connection failed" },
        });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Database connection failed");
    });
  });

  describe("POST", () => {
    it("creates folder for authenticated user", async () => {
      const mockUser = { id: "test-user-id" };
      const mockFolder = {
        id: "folder-1",
        name: "New Folder",
        user_id: "test-user-id",
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });
      mockSupabase.from().insert().select().single().mockResolvedValue({
        data: mockFolder,
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/folders", {
        method: "POST",
        body: JSON.stringify({ name: "New Folder" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockFolder);
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        name: "New Folder",
        user_id: "test-user-id",
      });
    });

    it("returns 401 for unauthenticated user", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const request = new NextRequest("http://localhost:3000/api/folders", {
        method: "POST",
        body: JSON.stringify({ name: "New Folder" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("returns 400 for invalid folder name", async () => {
      const mockUser = { id: "test-user-id" };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      const request = new NextRequest("http://localhost:3000/api/folders", {
        method: "POST",
        body: JSON.stringify({ name: "" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Name is required");
    });

    it("trims whitespace from folder name", async () => {
      const mockUser = { id: "test-user-id" };
      const mockFolder = {
        id: "folder-1",
        name: "Trimmed Folder",
        user_id: "test-user-id",
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });
      mockSupabase.from().insert().select().single().mockResolvedValue({
        data: mockFolder,
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/folders", {
        method: "POST",
        body: JSON.stringify({ name: "  Trimmed Folder  " }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        name: "Trimmed Folder",
        user_id: "test-user-id",
      });
    });

    it("handles database errors", async () => {
      const mockUser = { id: "test-user-id" };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });
      mockSupabase
        .from()
        .insert()
        .select()
        .single()
        .mockResolvedValue({
          data: null,
          error: { message: "Database constraint violation" },
        });

      const request = new NextRequest("http://localhost:3000/api/folders", {
        method: "POST",
        body: JSON.stringify({ name: "New Folder" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Database constraint violation");
    });
  });
});
