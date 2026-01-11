"use client";

import { useState } from "react";
import { updateNote } from "@/lib/actions/notes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NoteEditor } from "@/components/note-editor";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/tag-input";

interface EditNoteFormProps {
  noteId: string;
  initialTitle: string;
  initialContent: string;
  initialTags: string[];
  error?: string;
}

export function EditNoteForm({
  noteId,
  initialTitle,
  initialContent,
  initialTags,
  error,
}: EditNoteFormProps) {
  const [tags, setTags] = useState<string[]>(initialTags);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update your note</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={updateNote.bind(null, noteId)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter note title"
              defaultValue={initialTitle}
              required
              autoFocus
            />
          </div>
          <TagInput value={tags} onChange={setTags} />
          <input type="hidden" name="tags" value={JSON.stringify(tags)} />
          <NoteEditor initialContent={initialContent} noteId={noteId} tags={tags} />
          <div className="flex gap-2">
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
