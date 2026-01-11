"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ViewMode = "editor" | "split" | "preview";

export function NoteEditor({
  initialContent,
  name = "content",
}: {
  initialContent?: string;
  name?: string;
}) {
  const [content, setContent] = useState(initialContent || "");
  const [viewMode, setViewMode] = useState<ViewMode>("split");

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
