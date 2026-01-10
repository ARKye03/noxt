import { Button } from "@/components/ui/button";
import { validateRequest } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const { user } = await validateRequest();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <main className="flex flex-col items-center gap-8 text-center max-w-2xl w-full">
        <h1 className="text-6xl font-bold tracking-tight">
          Personal Knowledge Base
        </h1>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Welcome back, {user?.name || user?.email}!</CardTitle>
            <CardDescription>
              Your personal space to capture and organize knowledge
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-left space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Email:</span> {user?.email}
              </p>
              {user?.name && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Name:</span> {user.name}
                </p>
              )}
            </div>
            <form action={logout}>
              <Button type="submit" variant="outline" className="w-full">
                Logout
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-muted-foreground">
          Start creating your notes and building your knowledge base
        </p>
      </main>
    </div>
  );
}
