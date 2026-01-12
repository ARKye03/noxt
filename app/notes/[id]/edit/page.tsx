import { getNote } from "@/lib/actions/notes";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EditNoteForm } from "@/components/edit-note-form";
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

        <EditNoteForm
          noteId={id}
          initialTitle={note.title}
          initialContent={note.content}
          initialTags={note.noteTags.map((nt) => nt.tag.name)}
          error={error}
        />
      </div>
    </div>
  );
}
