"use client";

import { deleteNote } from "@/lib/actions/notes";
import { Button } from "@/components/ui/button";
import { useState, forwardRef, useImperativeHandle } from "react";

export interface DeleteNoteButtonRef {
  triggerDelete: () => void;
}

export const DeleteNoteButton = forwardRef<DeleteNoteButtonRef, { noteId: string }>(
  ({ noteId }, ref) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
      if (!confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
        return;
      }

      setIsDeleting(true);
      await deleteNote(noteId);
    };

    useImperativeHandle(ref, () => ({
      triggerDelete: handleDelete,
    }));

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
);

DeleteNoteButton.displayName = "DeleteNoteButton";
