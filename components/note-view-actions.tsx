"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { DeleteNoteButton, DeleteNoteButtonRef } from "@/components/delete-note-button";
import { NoteViewShortcuts } from "@/components/note-view-shortcuts";
import Link from "next/link";

interface NoteViewActionsProps {
  noteId: string;
}

export function NoteViewActions({ noteId }: NoteViewActionsProps) {
  const deleteButtonRef = useRef<DeleteNoteButtonRef>(null);

  const handleDeleteShortcut = () => {
    deleteButtonRef.current?.triggerDelete();
  };

  return (
    <>
      <NoteViewShortcuts noteId={noteId} onDelete={handleDeleteShortcut} />
      <div className="pt-4 border-t space-y-2">
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/notes/${noteId}/edit`}>Edit</Link>
          </Button>
          <DeleteNoteButton ref={deleteButtonRef} noteId={noteId} />
        </div>
        <p className="text-xs text-muted-foreground">
          ⌘+E: Edit • ⌘+⌫: Delete • ⌘+H: Home
        </p>
      </div>
    </>
  );
}
