import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewNoteForm } from "@/components/new-note-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function NewNotePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { user } = await validateRequest();

  if (!user) {
    return redirect("/login");
  }

  const params = await searchParams;
  const error = params.error;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">New Note</h1>
          <Button variant="outline" asChild>
            <Link href="/">Cancel</Link>
          </Button>
        </div>

        <NewNoteForm error={error} />
      </div>
    </div>
  );
}
