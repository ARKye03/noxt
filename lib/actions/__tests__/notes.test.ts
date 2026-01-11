import { describe, it, expect, vi, beforeEach } from "vitest";
import { createNote, getNotes, getNote, updateNote, deleteNote } from "../notes";

// Mock modules
vi.mock("@/lib/auth", () => ({
  validateRequest: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    note: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    tag: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
    noteTag: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { validateRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const mockValidateRequest = validateRequest as any;
const mockDb = db as typeof db & {
  note: {
    create: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  tag: {
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
  noteTag: {
    create: ReturnType<typeof vi.fn>;
    deleteMany: ReturnType<typeof vi.fn>;
  };
};
const mockRedirect = redirect as any;

describe("notes actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createNote", () => {
    it("redirects to login when user is not authenticated", async () => {
      mockValidateRequest.mockResolvedValue({ user: null, session: null });
      const formData = new FormData();

      await expect(createNote(formData)).rejects.toThrow("REDIRECT:/login");
    });

    it("redirects with error when title is missing", async () => {
      mockValidateRequest.mockResolvedValue({
        user: { id: "user1" } as any,
        session: {} as any,
      });
      const formData = new FormData();
      formData.set("content", "Test content");

      await expect(createNote(formData)).rejects.toThrow(
        "REDIRECT:/notes/new?error=Title and content are required"
      );
    });

    it("redirects with error when content is missing", async () => {
      mockValidateRequest.mockResolvedValue({
        user: { id: "user1" } as any,
        session: {} as any,
      });
      const formData = new FormData();
      formData.set("title", "Test title");

      await expect(createNote(formData)).rejects.toThrow(
        "REDIRECT:/notes/new?error=Title and content are required"
      );
    });

    it("creates note and redirects to home on success", async () => {
      mockValidateRequest.mockResolvedValue({
        user: { id: "user1" } as any,
        session: {} as any,
      });
      mockDb.note.create.mockResolvedValue({
        id: "note1",
        title: "Test",
        content: "Content",
        userId: "user1",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const formData = new FormData();
      formData.set("title", "Test");
      formData.set("content", "Content");

      await expect(createNote(formData)).rejects.toThrow("REDIRECT:/");
      expect(mockDb.note.create).toHaveBeenCalledWith({
        data: {
          title: "Test",
          content: "Content",
          userId: "user1",
        },
      });
    });
  });

  describe("getNotes", () => {
    it("returns all notes for a user", async () => {
      const mockNotes = [
        {
          id: "1",
          title: "Note 1",
          content: "Content 1",
          userId: "user1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          title: "Note 2",
          content: "Content 2",
          userId: "user1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockDb.note.findMany.mockResolvedValue(mockNotes);

      const result = await getNotes("user1");

      expect(result).toEqual(mockNotes);
      expect(mockDb.note.findMany).toHaveBeenCalledWith({
        where: { userId: "user1" },
        include: {
          noteTags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });
    });
  });

  describe("getNote", () => {
    it("returns a single note for a user", async () => {
      const mockNote = {
        id: "note1",
        title: "Test",
        content: "Content",
        userId: "user1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDb.note.findFirst.mockResolvedValue(mockNote);

      const result = await getNote("note1", "user1");

      expect(result).toEqual(mockNote);
      expect(mockDb.note.findFirst).toHaveBeenCalledWith({
        where: {
          id: "note1",
          userId: "user1",
        },
        include: {
          noteTags: {
            include: {
              tag: true,
            },
          },
        },
      });
    });
  });

  describe("updateNote", () => {
    it("redirects to login when user is not authenticated", async () => {
      mockValidateRequest.mockResolvedValue({ user: null, session: null });
      const formData = new FormData();

      await expect(updateNote("note1", formData)).rejects.toThrow(
        "REDIRECT:/login"
      );
    });

    it("redirects with error when title is missing", async () => {
      mockValidateRequest.mockResolvedValue({
        user: { id: "user1" } as any,
        session: {} as any,
      });
      const formData = new FormData();
      formData.set("content", "Updated content");

      await expect(updateNote("note1", formData)).rejects.toThrow(
        "REDIRECT:/notes/note1/edit?error=Title and content are required"
      );
    });

    it("redirects to home when note doesn't exist or doesn't belong to user", async () => {
      mockValidateRequest.mockResolvedValue({
        user: { id: "user1" } as any,
        session: {} as any,
      });
      mockDb.note.findFirst.mockResolvedValue(null);

      const formData = new FormData();
      formData.set("title", "Updated");
      formData.set("content", "Updated content");

      await expect(updateNote("note1", formData)).rejects.toThrow(
        "REDIRECT:/"
      );
    });

    it("updates note and redirects to note view on success", async () => {
      mockValidateRequest.mockResolvedValue({
        user: { id: "user1" } as any,
        session: {} as any,
      });
      mockDb.note.findFirst.mockResolvedValue({
        id: "note1",
        title: "Old",
        content: "Old content",
        userId: "user1",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockDb.note.update.mockResolvedValue({
        id: "note1",
        title: "Updated",
        content: "Updated content",
        userId: "user1",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockDb.noteTag.deleteMany.mockResolvedValue({ count: 0 });

      const formData = new FormData();
      formData.set("title", "Updated");
      formData.set("content", "Updated content");
      formData.set("tags", "[]");

      await expect(updateNote("note1", formData)).rejects.toThrow(
        "REDIRECT:/notes/note1"
      );
      expect(mockDb.note.update).toHaveBeenCalledWith({
        where: { id: "note1" },
        data: {
          title: "Updated",
          content: "Updated content",
        },
      });
    });
  });

  describe("deleteNote", () => {
    it("redirects to login when user is not authenticated", async () => {
      mockValidateRequest.mockResolvedValue({ user: null, session: null });

      await expect(deleteNote("note1")).rejects.toThrow("REDIRECT:/login");
    });

    it("redirects to home when note doesn't exist or doesn't belong to user", async () => {
      mockValidateRequest.mockResolvedValue({
        user: { id: "user1" } as any,
        session: {} as any,
      });
      mockDb.note.findFirst.mockResolvedValue(null);

      await expect(deleteNote("note1")).rejects.toThrow("REDIRECT:/");
      expect(mockDb.note.delete).not.toHaveBeenCalled();
    });

    it("deletes note and redirects to home on success", async () => {
      mockValidateRequest.mockResolvedValue({
        user: { id: "user1" } as any,
        session: {} as any,
      });
      mockDb.note.findFirst.mockResolvedValue({
        id: "note1",
        title: "Test",
        content: "Content",
        userId: "user1",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockDb.note.delete.mockResolvedValue({
        id: "note1",
        title: "Test",
        content: "Content",
        userId: "user1",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(deleteNote("note1")).rejects.toThrow("REDIRECT:/");
      expect(mockDb.note.delete).toHaveBeenCalledWith({
        where: { id: "note1" },
      });
    });
  });
});
