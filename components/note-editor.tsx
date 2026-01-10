"use client";

import { useState } from "react";
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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>Content</Label>
        <div className="flex gap-1 rounded-md border border-border p-1">
          <button
            type="button"
            onClick={() => setViewMode("editor")}
            className={`px-3 py-1 text-xs rounded transition-colors ${viewMode === "editor"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
              }`}
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
