import { getNote } from "@/lib/actions/notes";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteNoteButton } from "@/components/delete-note-button";
import { MarkdownPreview } from "@/components/markdown-preview";
import Link from "next/link";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await validateRequest();

  if (!user) {
    return redirect("/login");
  }

  const { id } = await params;
  const note = await getNote(id, user.id);

  if (!note) {
    return redirect("/");
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" asChild>
            <Link href="/">← Back to Notes</Link>
          </Button>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {new Date(note.updatedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{note.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <MarkdownPreview content={note.content} />
            <div className="flex gap-2 pt-4 border-t">
              <Button asChild>
                <Link href={`/notes/${id}/edit`}>Edit</Link>
              </Button>
              <DeleteNoteButton noteId={id} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
