import Link from "next/link";
import {
  CalendarPlus,
  Link2,
  Users,
  ArrowRight,
  CheckCircle2,
  Star,
  Zap,
  Shield,
  ChevronDown,
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
  {
    icon: Zap,
    title: "Real-time updates",
    description:
      "Every RSVP lands instantly. No refresh needed — your dashboard stays live as responses come in.",
    color: "bg-amber-500/15 text-amber-400",
  },
  {
    icon: Shield,
    title: "Token-protected links",
    description:
      "Each invite URL carries a cryptographic token so only people with the link can respond.",
    color: "bg-rose-500/15 text-rose-400",
  },
  {
    icon: Star,
    title: "No account for guests",
    description:
      "Your attendees click, pick their status, and they're done. Zero sign-up friction on their end.",
    color: "bg-fuchsia-500/15 text-fuchsia-400",
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

const STATS = [
  { value: "10 sec", label: "to create an event" },
  { value: "0", label: "accounts needed for guests" },
  { value: "100%", label: "free to get started" },
  { value: "∞", label: "events you can create" },
];

const TESTIMONIALS = [
  {
    quote:
      "I used to coordinate birthday dinners over a messy WhatsApp thread. Now I just drop the link and the RSVPs sort themselves. Genuinely life-changing for group plans.",
    name: "Amara O.",
    role: "Frequent host, Lagos",
    avatar: "A",
    color: "bg-violet-500/20 text-violet-300",
    stars: 5,
  },
  {
    quote:
      "We ran our entire team offsite sign-up through this. No login walls for attendees, live counts in our dashboard — it's exactly what we needed without the bloat of full event software.",
    name: "Tom R.",
    role: "Engineering Lead, Berlin",
    avatar: "T",
    color: "bg-sky-500/20 text-sky-300",
    stars: 5,
  },
  {
    quote:
      "Sent the invite link at 9 am, had 40 RSVPs by noon. The shareable URL is so clean — people actually click it instead of ignoring the invite.",
    name: "Priya M.",
    role: "Community organiser, Bangalore",
    avatar: "P",
    color: "bg-emerald-500/20 text-emerald-300",
    stars: 5,
  },
  {
    quote:
      "Tried three other tools before landing here. The others were either too heavy or required my guests to make an account. This just works.",
    name: "Léa D.",
    role: "Event coordinator, Paris",
    avatar: "L",
    color: "bg-amber-500/20 text-amber-300",
    stars: 5,
  },
  {
    quote:
      "Our wedding RSVP process was painless. We sent one link in the save-the-date email and watched the Going/Maybe/Not Going board fill up in real time. So satisfying.",
    name: "Sam & Jordan K.",
    role: "Newlyweds, Toronto",
    avatar: "S",
    color: "bg-rose-500/20 text-rose-300",
    stars: 5,
  },
  {
    quote:
      "I run monthly neighbourhood meetups. This replaced three different spreadsheets and a confusing Google Form. The dashboard is clear, fast, and doesn't break on mobile.",
    name: "Kofi A.",
    role: "Community lead, Accra",
    avatar: "K",
    color: "bg-fuchsia-500/20 text-fuchsia-300",
    stars: 5,
  },
];

const FAQ = [
  {
    q: "Do my guests need an account to RSVP?",
    a: "No. Guests click your invite link, pick their status (Going / Maybe / Not Going), and they're done. Zero sign-up required on their side.",
  },
  {
    q: "How does the invite link work?",
    a: "Every event gets a unique, cryptographically signed URL. Only people with that link can view and respond to the event — it's not discoverable by anyone else.",
  },
  {
    q: "Can I edit an event after it's been shared?",
    a: "Yes. You can update the title, date, location, and description at any time from your dashboard. Guests who revisit the link will always see the latest details.",
  },
  {
    q: "Is there a limit on how many events I can create?",
    a: "Not on the free plan. Create as many events as you like and share them with as many guests as you need.",
  },
  {
    q: "Can I cancel or delete an event?",
    a: "Yes. From your dashboard you can delete any event you own. Deleting an event removes it and its RSVP data permanently.",
  },
  {
    q: "What tech powers this?",
    a: "Event Planner is built on Next.js 15, Neon Postgres for the database, and Neon Auth for authentication — so it's fast, scalable, and serverless from top to bottom.",
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
    <div className="flex flex-1 flex-col gap-32 pb-24">
      {/* ── Hero ── */}
      <section className="relative flex flex-col items-start gap-8 pt-16">
        {/* Decorative glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full blur-3xl opacity-15"
          style={{ background: "#955fff" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-8 -right-16 h-64 w-64 rounded-full blur-3xl opacity-10"
          style={{ background: "#6366f1" }}
        />

        <Badge variant="secondary" className="w-fit">
          Next.js 15 · Neon Auth · Neon Postgres
        </Badge>

        <h1 className="max-w-3xl text-5xl font-bold tracking-tight leading-[1.15] sm:text-6xl">
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
              <Link href="/auth/sign-up">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          </div>
        )}

        {/* Social proof avatars */}
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

      {/* ── Stats Bar ── */}
      <section
        className="rounded-2xl px-8 py-10"
        style={{
          background: "rgba(149,95,255,0.06)",
          border: "1px solid rgba(149,95,255,0.15)",
        }}
      >
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 text-center"
            >
              <span
                className="text-4xl font-black tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #955fff, #c084fc)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {value}
              </span>
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit">
            Features
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">
            Everything you need
          </h2>
          <p className="text-muted-foreground max-w-lg">
            A focused toolkit that gets out of your way and lets you focus on
            the event, not the admin.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
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
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit">
            How it works
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">
            Up and running in under a minute
          </h2>
          <p className="text-muted-foreground max-w-lg">
            Three steps from zero to a live event page with RSVP tracking.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map(({ number, title, description }, i) => (
            <div key={number} className="relative flex flex-col gap-4">
              {/* Connector line between steps (desktop) */}
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden
                  className="absolute top-6 left-full hidden w-full -translate-x-4 border-t border-dashed border-violet-500/20 md:block"
                  style={{ width: "calc(100% - 3rem)" }}
                />
              )}
              <span
                className="text-5xl font-black tracking-tighter"
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

      {/* ── Testimonials ── */}
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit">
            Testimonials
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">
            Loved by organisers everywhere
          </h2>
          <p className="text-muted-foreground max-w-lg">
            From birthday dinners to team offsites — here&apos;s what people are
            saying.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, role, avatar, color, stars }) => (
            <Card
              key={name}
              className="flex flex-col justify-between gap-6 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              <blockquote className="flex-1 text-sm text-muted-foreground leading-relaxed">
                &ldquo;{quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${color}`}
                >
                  {avatar}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{name}</span>
                  <span className="text-xs text-muted-foreground">{role}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit">
            FAQ
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">
            Common questions
          </h2>
          <p className="text-muted-foreground max-w-lg">
            Everything you need to know before you create your first event.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {FAQ.map(({ q, a }) => (
            <div
              key={q}
              className="rounded-xl p-6"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-start gap-3">
                <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold">{q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA Banner (logged-out only) ── */}
      {!isLoggedIn && (
        <section
          className="relative overflow-hidden rounded-2xl px-8 py-16 text-center"
          style={{
            background:
              "linear-gradient(135deg, #1a0f2e 0%, #16161f 50%, #0f1a2e 100%)",
            border: "1px solid rgba(149,95,255,0.25)",
          }}
        >
          {/* Glow blobs */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 left-1/4 h-56 w-56 rounded-full blur-3xl opacity-30"
            style={{ background: "#955fff" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 right-1/4 h-56 w-56 rounded-full blur-3xl opacity-20"
            style={{ background: "#6366f1" }}
          />

          <div className="relative flex flex-col items-center gap-6">
            <Badge variant="secondary" className="w-fit">
              Free to get started
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight">
              Ready to plan your next event?
            </h2>
            <p className="max-w-md text-muted-foreground text-lg">
              Create your free account and have your first event live in under a
              minute.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
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
