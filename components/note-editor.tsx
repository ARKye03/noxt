"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MarkdownPreview } from "@/components/markdown-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NoteEditor({
  initialContent,
  name = "content",
}: {
  initialContent?: string;
  name?: string;
}) {
  const [content, setContent] = useState(initialContent || "");
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>Content</Label>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Textarea
            id={name}
            name={name}
            className="field-sizing-content"
            placeholder="Write your note here... (Markdown supported)"
            rows={20}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Supports Markdown: **bold**, *italic*, `code`, [links](url), etc.
          </p>
        </div>
        {showPreview && (
          <Card className="lg:sticky lg:top-4">
            <CardHeader>
              <CardTitle className="text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-auto">
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
