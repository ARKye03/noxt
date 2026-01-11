"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface NoteViewShortcutsProps {
  noteId: string;
  onDelete: () => void;
}

export function NoteViewShortcuts({ noteId, onDelete }: NoteViewShortcutsProps) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;

      // Ctrl/Cmd+E - Edit note
      if (isMod && e.key === "e") {
        e.preventDefault();
        router.push(`/notes/${noteId}/edit`);
      }
      // Ctrl/Cmd+Backspace - Delete note
      else if (isMod && e.key === "Backspace") {
        e.preventDefault();
        onDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, noteId, onDelete]);

  return null;
}
