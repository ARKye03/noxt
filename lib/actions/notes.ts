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
