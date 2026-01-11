"use client";

import { useState } from "react";
import { createNote } from "@/lib/actions/notes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NoteEditor } from "@/components/note-editor";
import { Button } from "@/components/ui/button";

export function NewNoteForm({ error }: { error?: string }) {
  const [noteId, setNoteId] = useState<string | undefined>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new note</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={createNote} className="space-y-4">
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
              required
              autoFocus
            />
          </div>
          <NoteEditor noteId={noteId} onNoteIdChange={setNoteId} />
          <div className="flex gap-2">
            <Button type="submit" className="w-full">
              Create Note
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
