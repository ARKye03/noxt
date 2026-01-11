"use server";

import { db } from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function createNote(formData: FormData) {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/login");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const tagsJson = formData.get("tags") as string;

  if (!title || !content) {
    redirect("/notes/new?error=Title and content are required");
  }

  const tags = tagsJson ? JSON.parse(tagsJson) : [];

  const note = await db.note.create({
    data: {
      title,
      content,
      userId: user.id,
    },
  });

  // Create or connect tags
  if (tags.length > 0) {
    for (const tagName of tags) {
      // Find or create tag
      let tag = await db.tag.findFirst({
        where: { name: tagName, userId: user.id },
      });

      if (!tag) {
        tag = await db.tag.create({
          data: { name: tagName, userId: user.id },
        });
      }

      // Create note-tag relationship
      await db.noteTag.create({
        data: {
          noteId: note.id,
          tagId: tag.id,
        },
      });
    }
  }

  redirect("/");
}

export async function getNotes(userId: string) {
  return await db.note.findMany({
    where: { userId },
    include: {
      noteTags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getNote(id: string, userId: string) {
  return await db.note.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      noteTags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

export async function updateNote(id: string, formData: FormData) {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/login");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const tagsJson = formData.get("tags") as string;

  if (!title || !content) {
    redirect(`/notes/${id}/edit?error=Title and content are required`);
  }

  // Verify the note belongs to the user
  const note = await db.note.findFirst({
    where: { id, userId: user.id },
  });

  if (!note) {
    redirect("/");
  }

  await db.note.update({
    where: { id },
    data: {
      title,
      content,
    },
  });

  // Update tags
  const tags = tagsJson ? JSON.parse(tagsJson) : [];

  // Delete existing note-tag relationships
  await db.noteTag.deleteMany({
    where: { noteId: id },
  });

  // Create new note-tag relationships
  if (tags.length > 0) {
    for (const tagName of tags) {
      // Find or create tag
      let tag = await db.tag.findFirst({
        where: { name: tagName, userId: user.id },
      });

      if (!tag) {
        tag = await db.tag.create({
          data: { name: tagName, userId: user.id },
        });
      }

      // Create note-tag relationship
      await db.noteTag.create({
        data: {
          noteId: id,
          tagId: tag.id,
        },
      });
    }
  }

  redirect(`/notes/${id}`);
}

export async function deleteNote(id: string) {
  const { user } = await validateRequest();

  if (!user) {
    redirect("/login");
  }

  // Verify the note belongs to the user
  const note = await db.note.findFirst({
    where: { id, userId: user.id },
  });

  if (!note) {
    redirect("/");
  }

  await db.note.delete({
    where: { id },
  });

  redirect("/");
}

export async function autosaveNote(data: {
  id?: string;
  title: string;
  content: string;
  tags?: string[];
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const { user } = await validateRequest();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  if (!data.title || !data.content) {
    return { success: false, error: "Title and content are required" };
  }

  try {
    if (data.id) {
      // Update existing note
      const note = await db.note.findFirst({
        where: { id: data.id, userId: user.id },
      });

      if (!note) {
        return { success: false, error: "Note not found" };
      }

      await db.note.update({
        where: { id: data.id },
        data: {
          title: data.title,
          content: data.content,
        },
      });

      // Update tags if provided
      if (data.tags) {
        // Delete existing note-tag relationships
        await db.noteTag.deleteMany({
          where: { noteId: data.id },
        });

        // Create new note-tag relationships
        if (data.tags.length > 0) {
          for (const tagName of data.tags) {
            // Find or create tag
            let tag = await db.tag.findFirst({
              where: { name: tagName, userId: user.id },
            });

            if (!tag) {
              tag = await db.tag.create({
                data: { name: tagName, userId: user.id },
              });
            }

            // Create note-tag relationship
            await db.noteTag.create({
              data: {
                noteId: data.id,
                tagId: tag.id,
              },
            });
          }
        }
      }

      return { success: true, id: data.id };
    } else {
      // Create new note
      const note = await db.note.create({
        data: {
          title: data.title,
          content: data.content,
          userId: user.id,
        },
      });

      // Create tags if provided
      if (data.tags && data.tags.length > 0) {
        for (const tagName of data.tags) {
          // Find or create tag
          let tag = await db.tag.findFirst({
            where: { name: tagName, userId: user.id },
          });

          if (!tag) {
            tag = await db.tag.create({
              data: { name: tagName, userId: user.id },
            });
          }

          // Create note-tag relationship
          await db.noteTag.create({
            data: {
              noteId: note.id,
              tagId: tag.id,
            },
          });
        }
      }

      return { success: true, id: note.id };
    }
  } catch (error) {
    console.error("Autosave error:", error);
    return { success: false, error: "Failed to save note" };
  }
}

export async function getUserTags(userId: string) {
  return await db.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}
