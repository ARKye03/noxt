"use client";

import { deleteNote } from "@/lib/actions/notes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, forwardRef, useImperativeHandle } from "react";

export interface DeleteNoteButtonRef {
  triggerDelete: () => void;
}

export const DeleteNoteButton = forwardRef<DeleteNoteButtonRef, { noteId: string }>(
  ({ noteId }, ref) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
      setIsDeleting(true);
      await deleteNote(noteId);
    };

    useImperativeHandle(ref, () => ({
      triggerDelete: () => setOpen(true),
    }));

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">Delete</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

DeleteNoteButton.displayName = "DeleteNoteButton";
