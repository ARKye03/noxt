import { getNote, updateNote } from "@/lib/actions/notes";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NoteEditor } from "@/components/note-editor";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function EditNotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
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

  const paramsData = await searchParams;
  const error = paramsData.error;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Edit Note</h1>
          <Button variant="outline" asChild>
            <Link href={`/notes/${id}`}>Cancel</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Update your note</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateNote.bind(null, id)} className="space-y-4">
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
                  defaultValue={note.title}
                  required
                  autoFocus
                />
              </div>
              <NoteEditor initialContent={note.content} />
              <div className="flex gap-2">
                <Button type="submit" className="w-full">
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
