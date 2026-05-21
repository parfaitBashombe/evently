import Link from "next/link";
import { CalendarDays } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.606 0.248 292 / 0.15), transparent)",
        }}
      />

      {/* Logo / back to home */}
      <Link
        href="/"
        className="mb-10 flex items-center gap-2.5 transition-opacity hover:opacity-70"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/30">
          <CalendarDays className="h-4 w-4 text-violet-400" />
        </span>
        <span className="text-sm font-semibold tracking-tight">Evently</span>
      </Link>

      {/* Auth form container */}
      <div className="w-full max-w-sm">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/40">
          {/* Violet top accent line */}
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-violet-500/60 to-transparent" />
          {children}
        </div>
      </div>

      {/* Footer link */}
      <p className="mt-8 text-xs text-muted-foreground">
        By continuing, you agree to our terms of service.{" "}
        <Link href="/" className="text-violet-400 hover:text-violet-300 underline underline-offset-2">
          Back to home
        </Link>
      </p>
    </div>
  );
}
