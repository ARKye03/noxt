"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export function NotesList({ notes }: { notes: Note[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(
    () =>
      new Fuse(notes, {
        keys: ["title", "content"],
        threshold: 0.3, // Lower = more strict, higher = more fuzzy
        includeScore: true,
      }),
    [notes]
  );

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) {
      return notes;
    }

    const results = fuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [searchQuery, fuse, notes]);

  if (notes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">
            No notes yet. Create your first note to get started!
          </p>
          <Button asChild>
            <Link href="/notes/new">Create Note</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="search"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        {searchQuery && (
          <Button
            variant="outline"
            onClick={() => setSearchQuery("")}
          >
            Clear
          </Button>
        )}
      </div>

      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-2">
              No notes found for &quot;{searchQuery}&quot;
            </p>
            <p className="text-sm text-muted-foreground">
              Try a different search term
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              Found {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredNotes.map((note) => (
              <Link href={`/notes/${note.id}`} key={note.id}>
                <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{note.title}</CardTitle>
                    <CardDescription>
                      {new Date(note.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {note.content}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
