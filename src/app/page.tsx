import Link from "next/link";
import {
  CalendarPlus,
  Link2,
  Users,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth/server";

const FEATURES = [
  {
    icon: CalendarPlus,
    title: "Create events instantly",
    description:
      "Set a title, date, location and description in seconds. No fuss, no friction.",
    color: "bg-violet-500/15 text-violet-400",
  },
  {
    icon: Link2,
    title: "Share invite links",
    description:
      "Generate a unique, token-protected link per event. Guests RSVP without needing an account.",
    color: "bg-sky-500/15 text-sky-400",
  },
  {
    icon: Users,
    title: "Track attendance",
    description:
      "See real-time Going, Maybe and Not Going counts with a full attendee list at a glance.",
    color: "bg-emerald-500/15 text-emerald-400",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Create an event",
    description: "Add your event title, date, location, and any extra details.",
  },
  {
    number: "02",
    title: "Share the invite link",
    description:
      "Generate a unique link and send it to your guests however you like.",
  },
  {
    number: "03",
    title: "Watch RSVPs roll in",
    description:
      "Track who's going, who's maybe, and who can't make it — all in one place.",
  },
];

const Home = async () => {
  let isLoggedIn = false;
  try {
    const session = await getSession();
    isLoggedIn = Boolean(session.data);
  } catch (error) {
    console.error("Error checking session:", error);
    isLoggedIn = false;
  }

  return (
    <div className="flex flex-1 flex-col gap-24 pb-16">
      {/* ── Hero ── */}
      <section className="relative flex flex-col items-start gap-8 pt-12">
        {/* Decorative glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full blur-3xl opacity-20"
          style={{ background: "#955fff" }}
        />

        <Badge variant="secondary" className="w-fit">
          Next.js 16 · Neon Auth · Neon Postgres
        </Badge>

        <h1 className="max-w-3xl text-5xl font-bold tracking-tight leading-[1.15]">
          Plan events, <br className="hidden sm:block" />
          share links,{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #955fff 0%, #c084fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            track RSVPs.
          </span>
        </h1>

        <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
          Create events in seconds, generate a unique invite link, and watch
          attendee status update in real-time — no account needed for your
          guests.
        </p>

        {/* Auth-aware CTAs */}
        {isLoggedIn ? (
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/events/new">Create an event</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">Get started free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          </div>
        )}

        {/* Social proof */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex -space-x-2">
            {["A", "B", "C", "D"].map((letter) => (
              <div
                key={letter}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-xs font-semibold"
                style={{ background: "#1f1f2a" }}
              >
                {letter}
              </div>
            ))}
          </div>
          <span>Trusted by event organisers worldwide</span>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Everything you need
          </h2>
          <p className="text-muted-foreground">
            A focused toolkit that gets out of your way.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description, color }) => (
            <Card
              key={title}
              className="group transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardHeader className="gap-4">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            How it works
          </h2>
          <p className="text-muted-foreground">
            Up and running in under a minute.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map(({ number, title, description }) => (
            <div key={number} className="flex flex-col gap-3">
              <span
                className="text-4xl font-black tracking-tighter"
                style={{
                  background: "linear-gradient(135deg, #955fff55, #955fff22)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {number}
              </span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-400" />
                <h3 className="font-semibold">{title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA Banner (logged-out only) ── */}
      {!isLoggedIn && (
        <section
          className="relative overflow-hidden rounded-2xl px-8 py-12 text-center"
          style={{
            background:
              "linear-gradient(135deg, #1a0f2e 0%, #16161f 50%, #0f1a2e 100%)",
            border: "1px solid rgba(149,95,255,0.25)",
          }}
        >
          {/* Glow blobs */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 left-1/4 h-48 w-48 rounded-full blur-3xl opacity-30"
            style={{ background: "#955fff" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 right-1/4 h-48 w-48 rounded-full blur-3xl opacity-20"
            style={{ background: "#6366f1" }}
          />

          <div className="relative flex flex-col items-center gap-5">
            <Badge variant="secondary" className="w-fit">
              Free to get started
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to plan your next event?
            </h2>
            <p className="max-w-md text-muted-foreground">
              Create your free account and have your first event live in under a
              minute.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">
                  Create free account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
