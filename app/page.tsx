import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-6xl font-bold tracking-tight">
          Hello World
        </h1>
        <p className="text-xl text-muted-foreground max-w-md">
          Welcome to your Next.js starter pack with shadcn/ui components and automatic dark mode support.
        </p>
        <div className="flex gap-4">
          <Button size="lg">Get Started</Button>
          <Button variant="outline" size="lg">Learn More</Button>
        </div>
      </main>
    </div>
  );
}
