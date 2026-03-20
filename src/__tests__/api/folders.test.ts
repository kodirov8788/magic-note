jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

import { GET, POST } from "@/app/api/folders/route";
import { createClient } from "@/lib/supabase/server";

const createFoldersQuery = () => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockResolvedValue({
    data: [],
    error: null,
  }),
  single: jest.fn().mockResolvedValue({
    data: null,
    error: null,
  }),
});

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(),
};

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => mockSupabase),
}));

(createClient as jest.Mock).mockResolvedValue(mockSupabase);

describe("/api/folders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.from.mockReturnValue(createFoldersQuery());
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
      mockSupabase.from().order.mockResolvedValue({
        data: mockFolders,
        error: null,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockFolders);
      expect(mockSupabase.from).toHaveBeenCalledWith("folders");
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
      mockSupabase.from().order.mockResolvedValue({
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
      mockSupabase.from().single.mockResolvedValue({
        data: mockFolder,
        error: null,
      });

      const request = {
        json: async () => ({ name: "New Folder" }),
      };

      const response = await POST(request as never);
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

      const request = {
        json: async () => ({ name: "New Folder" }),
      };

      const response = await POST(request as never);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("returns 400 for invalid folder name", async () => {
      const mockUser = { id: "test-user-id" };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
      });

      const request = {
        json: async () => ({ name: "" }),
      };

      const response = await POST(request as never);
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
      mockSupabase.from().single.mockResolvedValue({
        data: mockFolder,
        error: null,
      });

      const request = {
        json: async () => ({ name: "  Trimmed Folder  " }),
      };

      const response = await POST(request as never);

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
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { message: "Database constraint violation" },
      });

      const request = {
        json: async () => ({ name: "New Folder" }),
      };

      const response = await POST(request as never);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Database constraint violation");
    });
  });
});
