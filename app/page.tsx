import { Button } from "@/components/ui/button";
import { validateRequest } from "@/lib/auth";
import { getNotes } from "@/lib/actions/notes";
import { NotesList } from "@/components/notes-list";
import { HomeShortcuts } from "@/components/home-shortcuts";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";

export default async function Home() {
  const { user } = await validateRequest();

  if (!user) {
    return null;
  }

  const notes = await getNotes(user.id);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <HomeShortcuts />
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Notes</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name || user.email}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/notes/new">New Note</Link>
              </Button>
              <LogoutButton />
            </div>
            <p className="text-xs text-muted-foreground">Press N: New note</p>
          </div>
        </div>

        <NotesList notes={notes} />
      </div>
    </div>
  );
}
