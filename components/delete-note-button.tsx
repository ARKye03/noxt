"use client";

import { deleteNote } from "@/lib/actions/notes";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function DeleteNoteButton({ noteId }: { noteId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    await deleteNote(noteId);
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
