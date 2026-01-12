"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Fuse from "fuse.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  noteTags: {
    tag: {
      id: string;
      name: string;
    };
  }[];
}

export function NotesList({ notes }: { notes: Note[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get all unique tags from all notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((note) => {
      note.noteTags.forEach((nt) => tagSet.add(nt.tag.name));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  // Filter notes based on search query and selected tag
  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Filter by tag first
    if (selectedTag) {
      filtered = filtered.filter((note) =>
        note.noteTags.some((nt) => nt.tag.name === selectedTag)
      );
    }

    // Then filter by search query
    if (searchQuery.trim()) {
      const fuse = new Fuse(filtered, {
        keys: ["title", "content"],
        threshold: 0.3,
        includeScore: true,
      });
      const results = fuse.search(searchQuery);
      return results.map((result) => result.item);
    }

    return filtered;
  }, [searchQuery, selectedTag, notes]);

  // Keyboard shortcut to focus search (S key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if S is pressed and not in an input/textarea
      if (
        e.key === "s" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
          ref={searchInputRef}
          type="search"
          placeholder="Search notes... (Press S to focus)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        {(searchQuery || selectedTag) && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setSelectedTag(null);
            }}
          >
            Clear All
          </Button>
        )}
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground self-center">Filter by tag:</span>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? "default" : "secondary"}
              className="cursor-pointer hover:bg-primary/80"
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

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
          {(searchQuery || selectedTag) && (
            <p className="text-sm text-muted-foreground">
              Found {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
              {selectedTag && ` with tag "${selectedTag}"`}
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredNotes.map((note) => (
              <Link href={`/notes/${note.id}`} key={note.id}>
                <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{note.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      <span>
                        {new Date(note.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {note.noteTags.length > 0 && (
                        <span className="flex gap-1 flex-wrap">
                          {note.noteTags.map((nt) => (
                            <Badge key={nt.tag.id} variant="outline" className="text-xs">
                              {nt.tag.name}
                            </Badge>
                          ))}
                        </span>
                      )}
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
