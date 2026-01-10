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

  if (!title || !content) {
    redirect("/notes/new?error=Title and content are required");
  }

  await db.note.create({
    data: {
      title,
      content,
      userId: user.id,
    },
  });

  redirect("/");
}

export async function getNotes(userId: string) {
  return await db.note.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getNote(id: string, userId: string) {
  return await db.note.findFirst({
    where: {
      id,
      userId,
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
