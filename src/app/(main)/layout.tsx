import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { UserButton } from "@neondatabase/auth/react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-70"
          >
            <CalendarDays className="h-4.5 w-4.5 text-violet-400" />
            <span className="text-sm font-semibold tracking-tight">Evently</span>
          </Link>

          <nav className="flex items-center gap-5">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/events/new"
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 px-3 py-1 text-xs font-medium text-violet-400 transition-colors hover:bg-violet-500/15"
            >
              <CalendarDays className="h-3 w-3" />
              New event
            </Link>
            <div className="h-4 w-px bg-border" aria-hidden />
            <UserButton size="icon" />
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10">
        {children}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex h-12 w-full max-w-5xl items-center justify-between px-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 text-violet-400/60" />
            Evently
          </span>
          <p className="text-xs text-muted-foreground">
            Built on Next.js · Neon Auth · Neon Postgres
          </p>
        </div>
      </footer>
    </>
  );
}
