"use client";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { autosaveNote } from "@/lib/actions/notes";
import { toast } from "sonner";

type ViewMode = "editor" | "split" | "preview";

export function NoteEditor({
  initialContent,
  name = "content",
  noteId,
  onNoteIdChange,
  tags,
}: {
  initialContent?: string;
  name?: string;
  noteId?: string;
  onNoteIdChange?: (id: string) => void;
  tags?: string[];
}) {
  const [content, setContent] = useState(initialContent || "");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [isSaving, setIsSaving] = useState(false);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastIdRef = useRef<string | number | undefined>(undefined);
  const currentNoteIdRef = useRef<string | undefined>(noteId);

  // Update the ref when noteId prop changes
  useEffect(() => {
    currentNoteIdRef.current = noteId;
  }, [noteId]);

  // Autosave function
  const performAutosave = async () => {
    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
    const title = titleInput?.value || "";

    if (!title.trim() || !content.trim()) {
      return;
    }

    setIsSaving(true);

    // Show saving toast
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
    }
    toastIdRef.current = toast.loading("Saving note...");

    try {
      const result = await autosaveNote({
        id: currentNoteIdRef.current,
        title,
        content,
        tags,
      });

      if (result.success) {
        // If this was a new note, update the noteId
        if (!currentNoteIdRef.current && result.id) {
          currentNoteIdRef.current = result.id;
          onNoteIdChange?.(result.id);
        }

        // Show success toast
        toast.success("Note saved", { id: toastIdRef.current });
        toastIdRef.current = undefined;
      } else {
        toast.error(result.error || "Failed to save note", { id: toastIdRef.current });
        toastIdRef.current = undefined;
      }
    } catch (error) {
      toast.error("Failed to save note", { id: toastIdRef.current });
      toastIdRef.current = undefined;
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced autosave effect for content changes
  useEffect(() => {
    // Clear existing timeout
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    // Set new timeout for autosave (750ms)
    autosaveTimeoutRef.current = setTimeout(() => {
      performAutosave();
    }, 750);

    // Cleanup
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [content]);

  // Listen for title changes and trigger autosave
  useEffect(() => {
    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;

    if (!titleInput) return;

    const handleTitleChange = () => {
      // Clear existing timeout
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }

      // Set new timeout for autosave (750ms)
      autosaveTimeoutRef.current = setTimeout(() => {
        performAutosave();
      }, 750);
    };

    titleInput.addEventListener('input', handleTitleChange);

    return () => {
      titleInput.removeEventListener('input', handleTitleChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl/Cmd modifier
      const isMod = e.ctrlKey || e.metaKey;

      // View mode shortcuts: Ctrl/Cmd+1/2/3
      if (isMod && e.key === "1") {
        e.preventDefault();
        setViewMode("editor");
      } else if (isMod && e.key === "2") {
        e.preventDefault();
        setViewMode("split");
      } else if (isMod && e.key === "3") {
        e.preventDefault();
        setViewMode("preview");
      }
      // Save shortcut: Ctrl/Cmd+S
      else if (isMod && e.key === "s") {
        e.preventDefault();
        // Find the form that contains this editor and submit it
        const form = document.querySelector("form");
        if (form) {
          form.requestSubmit();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Label htmlFor={name}>Content</Label>
          <span className="hidden md:inline text-xs text-muted-foreground">
            ⌘+1/2/3: Views • ⌘+S: Save
          </span>
        </div>
        <div className="flex gap-1 rounded-md border border-border p-1">
          <button
            type="button"
            onClick={() => setViewMode("editor")}
            className={`px-3 py-1 text-xs rounded transition-colors ${viewMode === "editor"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
              }`}
            title="Editor only (⌘+1)"
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`px-3 py-1 text-xs rounded transition-colors ${viewMode === "split"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
              }`}
            title="Split view (⌘+2)"
          >
            Split
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`px-3 py-1 text-xs rounded transition-colors ${viewMode === "preview"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
              }`}
            title="Preview only (⌘+3)"
          >
            Preview
          </button>
        </div>
      </div>
      <div className={`grid gap-4 ${viewMode === "split" ? "lg:grid-cols-2" : ""}`}>
        {(viewMode === "editor" || viewMode === "split") && (
          <div className="flex flex-col">
            <Textarea
              id={name}
              name={name}
              className="min-h-[200px] resize-y"
              placeholder="Write your note here... (Markdown supported)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Supports Markdown: **bold**, *italic*, `code`, [links](url), etc.
            </p>
          </div>
        )}
        {(viewMode === "preview" || viewMode === "split") && (
          <Card className={viewMode === "split" ? "lg:sticky lg:top-4" : ""}>
            <CardHeader>
              <CardTitle className="text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[200px] max-h-[600px] overflow-auto">
              {content ? (
                <MarkdownPreview content={content} />
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Start typing to see preview...
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
