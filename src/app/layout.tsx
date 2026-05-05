import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { NeonAuthUIProvider, UserButton } from "@neondatabase/auth/react";
import type { ComponentProps } from "react";
import { CalendarDays } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Evently — Plan events & track RSVPs",
  description:
    "Create events, share unique invite links, and track Going / Maybe / Not Going responses in real-time.",
};

type NeonAuthClient = ComponentProps<typeof NeonAuthUIProvider>["authClient"];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <NeonAuthUIProvider
          authClient={authClient as NeonAuthClient}
          defaultTheme="dark"
        >
          <header
            className="sticky top-0 z-50 border-b backdrop-blur-md"
            style={{
              borderColor: "rgba(149,95,255,0.12)",
              background: "rgba(10,10,15,0.85)",
            }}
          >
            {/* Subtle top-edge violet line */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, #955fff 40%, #c084fc 60%, transparent 100%)",
                opacity: 0.5,
              }}
            />

            <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
              {/* Wordmark */}
              <Link
                href="/"
                className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ background: "rgba(149,95,255,0.18)" }}
                >
                  <CalendarDays className="h-4 w-4 text-violet-400" />
                </span>
                <span
                  className="text-sm font-bold tracking-tight"
                  style={{
                    background:
                      "linear-gradient(135deg, #ffffff 40%, #c084fc 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Evently
                </span>
              </Link>

              {/* Nav */}
              <nav className="flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className="relative text-sm text-muted-foreground transition-colors hover:text-foreground
                    after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-violet-400
                    after:transition-all after:duration-200 hover:after:w-full"
                >
                  Dashboard
                </Link>
                <div
                  className="h-4 w-px"
                  style={{ background: "rgba(149,95,255,0.2)" }}
                  aria-hidden
                />
                <UserButton size="icon" />
              </nav>
            </div>
          </header>

          <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer
            className="border-t"
            style={{ borderColor: "rgba(149,95,255,0.1)" }}
          >
            <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-md"
                  style={{ background: "rgba(149,95,255,0.12)" }}
                >
                  <CalendarDays className="h-3 w-3 text-violet-400" />
                </span>
                Evently
              </span>
              <p className="text-xs text-muted-foreground">
                Built on Next.js · Neon Auth · Neon Postgres
              </p>
            </div>
          </footer>
        </NeonAuthUIProvider>
      </body>
    </html>
  );
}
