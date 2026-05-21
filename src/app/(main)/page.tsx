import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Users,
  BarChart3,
  Shield,
  Zap,
  Globe,
  Lock,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Clock,
  MapPin,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

const TESTIMONIALS = [
  {
    quote: "I used Evently for our company hackathon. Had 80 RSVPs in the first hour — I didn't have to do a thing.",
    name: "Sarah K.",
    role: "Engineering Manager",
    initials: "SK",
  },
  {
    quote: "The analytics tab is incredibly useful. I knew exactly how full we'd be a week out.",
    name: "Marcus T.",
    role: "Community Organiser",
    initials: "MT",
  },
  {
    quote: "Guests love that they don't need an account. Zero friction on their end.",
    name: "Léa D.",
    role: "Event Planner",
    initials: "LD",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Create your event",
    desc: "Fill in the details, add a cover image, set capacity and visibility in under 2 minutes.",
  },
  {
    n: "02",
    title: "Share the link",
    desc: "Copy your invite link and drop it anywhere — email, Slack, WhatsApp. No logins for guests.",
  },
  {
    n: "03",
    title: "Track RSVPs live",
    desc: "Watch responses roll in on your dashboard. Going, maybe, can't go — all in real time.",
  },
];

const Home = async () => {
  let isLoggedIn = false;
  try {
    const session = await getSession();
    isLoggedIn = Boolean(session?.data);
  } catch {
    isLoggedIn = false;
  }

  const publicEvents = await prisma.event.findMany({
    where: { status: "published", isPublic: true },
    orderBy: { eventDate: "asc" },
    take: 6,
    select: {
      id: true,
      title: true,
      description: true,
      coverImage: true,
      location: true,
      category: true,
      eventDate: true,
      capacity: true,
      invite: { select: { token: true } },
      rsvps: { select: { status: true } },
    },
  });

  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#080c18]">
        {/* Dot grid */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Aurora glows */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full"
            style={{
              background: "radial-gradient(ellipse, #004ac6 0%, #7c3aed 45%, transparent 70%)",
              filter: "blur(90px)",
              opacity: 0.28,
            }}
          />
          <div
            className="absolute top-2/3 -left-48 w-[500px] h-[400px] rounded-full"
            style={{
              background: "radial-gradient(ellipse, #7c3aed 0%, transparent 70%)",
              filter: "blur(70px)",
              opacity: 0.12,
            }}
          />
          <div
            className="absolute top-2/3 -right-48 w-[500px] h-[400px] rounded-full"
            style={{
              background: "radial-gradient(ellipse, #004ac6 0%, transparent 70%)",
              filter: "blur(70px)",
              opacity: 0.12,
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-10 text-center flex flex-col items-center gap-8 py-32">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-1.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_3px_rgba(52,211,153,0.55)]" />
            <span className="text-xs font-semibold text-white/80">Live on Evently</span>
            <span className="text-white/20">·</span>
            <span className="text-xs text-[#a5b4fc]">
              {publicEvents.length === 0
                ? "Be the first to create a public event"
                : `${publicEvents.length} public event${publicEvents.length !== 1 ? "s" : ""} right now`}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-[84px] font-extrabold tracking-tight leading-[0.92] text-white">
            Events that
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #818cf8 100%)",
              }}
            >
              leave a mark.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-lg leading-relaxed">
            Create, share, and manage events in minutes. RSVPs without accounts.
            Analytics without complexity.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <Link
              href={isLoggedIn ? "/dashboard" : "/auth/sign-up"}
              className="group flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:shadow-[0_0_40px_8px_rgba(0,74,198,0.4)] active:scale-95"
              style={{
                background: "linear-gradient(135deg, #004ac6 0%, #6d28d9 100%)",
              }}
            >
              {isLoggedIn ? "Go to dashboard" : "Start free"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href={isLoggedIn ? "/events/new" : "/auth/sign-in"}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-8 py-3.5 text-sm font-bold text-white/80 transition-all hover:bg-white/10 hover:text-white active:scale-95"
            >
              {isLoggedIn ? "Create an event" : "Sign in"}
            </Link>
          </div>

          {/* Trust pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2">
            {[
              { icon: <Zap className="h-3 w-3 text-amber-400" />, text: "Live in 2 minutes" },
              { icon: <Shield className="h-3 w-3 text-emerald-400" />, text: "No account for guests" },
              { icon: <BarChart3 className="h-3 w-3 text-blue-400" />, text: "Live analytics" },
            ].map(({ icon, text }) => (
              <span
                key={text}
                className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-xs font-medium text-white/55"
              >
                {icon}
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-25">
          <div className="h-9 w-[22px] rounded-full border border-white/40 flex items-start justify-center pt-1.5">
            <div className="h-1.5 w-1 rounded-full bg-white animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Bento Features ── */}
      <section className="py-24 md:py-32 max-w-7xl mx-auto w-full px-4 md:px-10">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#004ac6] mb-3">
            Built for organisers
          </p>
          <h2 className="text-3xl md:text-[44px] font-extrabold text-[#131b2e] leading-tight tracking-tight">
            Everything you need.
            <br />
            Nothing you don&apos;t.
          </h2>
        </div>

        {/* Bento grid — 3 col */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto">
          {/* Card 1 — Create fast (spans 2 cols) */}
          <div className="md:col-span-2 rounded-3xl bg-[#080c18] p-8 flex flex-col gap-6 relative overflow-hidden group min-h-[300px]">
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 25% 60%, rgba(0,74,198,0.18) 0%, transparent 65%)",
              }}
            />
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#004ac6]/20 shrink-0">
              <Zap className="h-5 w-5 text-[#60a5fa]" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Live in under 2 minutes
              </h3>
              <p className="text-sm text-white/50 leading-relaxed max-w-sm">
                Title, cover image, date, location — hit publish. Your event
                page is immediately live and shareable.
              </p>
            </div>
            {/* Mini form mockup */}
            <div className="mt-auto rounded-2xl border border-white/8 bg-white/4 p-4 flex flex-col gap-2.5">
              {["Event title", "Date & time", "Location"].map((label) => (
                <div
                  key={label}
                  className="h-9 rounded-xl bg-white/5 border border-white/8 flex items-center px-3"
                >
                  <span className="text-xs text-white/20">{label}…</span>
                </div>
              ))}
              <div
                className="h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white mt-1"
                style={{
                  background: "linear-gradient(135deg, #004ac6, #6d28d9)",
                }}
              >
                Publish event →
              </div>
            </div>
          </div>

          {/* Card 2 — No account */}
          <div className="rounded-3xl border border-[#c3c6d7]/30 bg-white p-7 flex flex-col gap-5 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 shrink-0">
              <Shield className="h-5 w-5 text-emerald-600" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-[#131b2e] mb-2">
                Zero friction for guests
              </h3>
              <p className="text-sm text-[#505f76] leading-relaxed">
                Guests RSVP in 10 seconds. No account, no password, no app to
                install.
              </p>
            </div>
            <div className="mt-auto flex flex-col gap-2">
              {[
                { label: "Name only", color: "bg-emerald-500" },
                { label: "Optional email", color: "bg-emerald-500" },
                { label: "Going / Maybe / No", color: "bg-emerald-500" },
              ].map(({ label, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 rounded-xl bg-[#f2f3ff] px-3 py-2"
                >
                  <span className={`h-2 w-2 rounded-full shrink-0 ${color}`} />
                  <span className="text-xs font-medium text-[#505f76]">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3 — Visibility */}
          <div className="rounded-3xl border border-[#c3c6d7]/30 bg-white p-7 flex flex-col gap-5 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#004ac6]/10 shrink-0">
              <Globe className="h-5 w-5 text-[#004ac6]" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-[#131b2e] mb-2">
                Public or private
              </h3>
              <p className="text-sm text-[#505f76] leading-relaxed">
                Public events are discoverable by anyone. Private ones live
                behind a secret invite link.
              </p>
            </div>
            <div className="mt-auto flex gap-2">
              <div className="flex-1 flex items-center gap-1.5 justify-center rounded-xl border border-[#004ac6]/20 bg-[#004ac6]/8 py-3 text-xs font-bold text-[#004ac6]">
                <Lock className="h-3.5 w-3.5" /> Private
              </div>
              <div className="flex-1 flex items-center gap-1.5 justify-center rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-xs font-bold text-emerald-700">
                <Globe className="h-3.5 w-3.5" /> Public
              </div>
            </div>
          </div>

          {/* Card 4 — Analytics (spans 2 cols) */}
          <div className="md:col-span-2 rounded-3xl bg-[#080c18] p-8 flex flex-col gap-6 relative overflow-hidden group min-h-[300px]">
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 75% 60%, rgba(124,58,237,0.15) 0%, transparent 65%)",
              }}
            />
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7c3aed]/20 shrink-0">
              <BarChart3 className="h-5 w-5 text-[#a78bfa]" />
            </span>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Real-time RSVP analytics
              </h3>
              <p className="text-sm text-white/50 leading-relaxed max-w-sm">
                Watch responses come in live. Know exactly who&apos;s coming
                before the day arrives.
              </p>
            </div>
            {/* Mock stat bars */}
            <div className="mt-auto grid grid-cols-3 gap-3">
              {[
                { label: "Going", pct: 68, color: "bg-emerald-500", text: "text-emerald-400", val: "68%" },
                { label: "Maybe", pct: 22, color: "bg-amber-500", text: "text-amber-400", val: "22%" },
                { label: "Not going", pct: 10, color: "bg-red-500", text: "text-red-400", val: "10%" },
              ].map(({ label, pct, color, text, val }) => (
                <div
                  key={label}
                  className="flex flex-col gap-2.5 rounded-2xl border border-white/8 bg-white/4 p-4"
                >
                  <span className={`text-2xl font-extrabold tabular-nums ${text}`}>
                    {val}
                  </span>
                  <span className="text-[11px] text-white/35 uppercase tracking-wide">
                    {label}
                  </span>
                  <div className="h-1 w-full rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Public Events ── */}
      <section className="py-24 md:py-32 bg-[#f2f3ff] border-y border-[#c3c6d7]/20">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#004ac6] mb-2">
                Happening now
              </p>
              <h2 className="text-3xl md:text-[44px] font-extrabold text-[#131b2e] leading-tight tracking-tight">
                Public events
              </h2>
              <p className="text-base text-[#505f76] mt-2">
                Discover what&apos;s on — RSVP in seconds, no account needed.
              </p>
            </div>
            {publicEvents.length > 0 && (
              <Link
                href={isLoggedIn ? "/dashboard" : "/auth/sign-in"}
                className="hidden md:flex items-center gap-1.5 rounded-lg border border-[#c3c6d7]/60 px-4 py-2 text-sm font-semibold text-[#505f76] transition-colors hover:border-[#004ac6]/30 hover:text-[#004ac6]"
              >
                Browse all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {publicEvents.length === 0 ? (
            <div className="flex flex-col items-center gap-7 rounded-3xl border-2 border-dashed border-[#c3c6d7]/50 bg-white/60 py-24 px-8 text-center">
              {/* Illustration */}
              <div className="relative flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-3xl bg-[#004ac6]/8" />
                <div className="absolute inset-3 rounded-2xl border border-[#004ac6]/15" />
                <Calendar className="h-10 w-10 text-[#004ac6]/30" />
                <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-[#c3c6d7]/50 bg-white shadow-sm">
                  <Globe className="h-3 w-3 text-[#004ac6]" />
                </span>
              </div>

              <div className="max-w-sm">
                <p className="text-xl font-extrabold text-[#131b2e] mb-2 tracking-tight">
                  Public events will appear here
                </p>
                <p className="text-sm text-[#505f76] leading-relaxed">
                  When organisers publish a public event, it shows up in this
                  section for anyone to discover and RSVP — no login required.
                </p>
              </div>

              <Link
                href={isLoggedIn ? "/events/new" : "/auth/sign-up"}
                className="flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-white transition-all hover:shadow-lg active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #004ac6, #6d28d9)",
                }}
              >
                {isLoggedIn
                  ? "Create a public event"
                  : "Be the first to post"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {publicEvents.map((ev) => {
                const goingCount = ev.rsvps.filter((r) => r.status === "going").length;
                const spotsLeft =
                  ev.capacity !== null
                    ? Math.max(0, ev.capacity - goingCount)
                    : null;
                const token = ev.invite?.token;
                const date = ev.eventDate ? new Date(ev.eventDate) : null;
                const month = date
                  ?.toLocaleString("en", { month: "short" })
                  .toUpperCase();
                const day = date?.getDate();
                const weekday = date?.toLocaleString("en", {
                  weekday: "long",
                });
                const time = date?.toLocaleString("en", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const isFull = spotsLeft === 0;

                return (
                  <Link
                    key={ev.id}
                    href={token ? `/e/${token}` : "#"}
                    className="group flex flex-col rounded-3xl bg-white border border-[#c3c6d7]/30 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#004ac6]/8 hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Cover */}
                    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#eaedff] to-[#dae2fd] shrink-0">
                      {ev.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ev.coverImage}
                          alt={ev.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-7xl font-black text-[#004ac6]/15 select-none">
                            {ev.title[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      {/* Category chip */}
                      {ev.category && (
                        <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#131b2e] shadow-sm">
                          {ev.category}
                        </span>
                      )}
                      {/* Date badge */}
                      {date && (
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2 text-center shadow-sm min-w-[52px]">
                          <span className="block text-[9px] font-bold text-[#505f76] uppercase tracking-widest">
                            {month}
                          </span>
                          <span className="block text-2xl font-extrabold text-[#004ac6] leading-none">
                            {day}
                          </span>
                        </div>
                      )}
                      {isFull && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-[#131b2e] uppercase tracking-wider">
                            Sold out
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-5 flex flex-col gap-2 flex-1">
                      <h3 className="font-bold text-[#131b2e] text-base leading-snug group-hover:text-[#004ac6] transition-colors line-clamp-2">
                        {ev.title}
                      </h3>
                      <div className="flex flex-col gap-1 text-xs text-[#505f76]">
                        {date && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-[#004ac6] shrink-0" />
                            {weekday}, {time}
                          </span>
                        )}
                        {ev.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-[#004ac6] shrink-0" />
                            <span className="truncate">{ev.location}</span>
                          </span>
                        )}
                      </div>
                      {ev.description && (
                        <p className="text-xs text-[#505f76] line-clamp-2 leading-relaxed mt-1">
                          {ev.description}
                        </p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-2 border-t border-[#c3c6d7]/20 px-5 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-[#505f76]">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        {goingCount > 0 ? (
                          <>
                            <strong className="text-[#131b2e] font-semibold">
                              {goingCount}
                            </strong>{" "}
                            going
                          </>
                        ) : (
                          <span>Be the first</span>
                        )}
                        {spotsLeft !== null &&
                          spotsLeft > 0 &&
                          spotsLeft <= 10 && (
                            <span className="ml-1 rounded-full bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                              {spotsLeft} left
                            </span>
                          )}
                      </div>
                      <span
                        className={`flex items-center gap-0.5 text-xs font-bold ${isFull ? "text-[#505f76]" : "text-[#004ac6]"}`}
                      >
                        {isFull ? "Full" : "RSVP"}
                        {!isFull && <ChevronRight className="h-3.5 w-3.5" />}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 md:py-32 max-w-7xl mx-auto w-full px-4 md:px-10">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-[#004ac6] mb-3">
            Simple by design
          </p>
          <h2 className="text-3xl md:text-[44px] font-extrabold text-[#131b2e] leading-tight tracking-tight">
            How it works
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+44px)] right-[calc(16.67%+44px)] h-px bg-gradient-to-r from-[#004ac6]/20 via-[#7c3aed]/30 to-[#004ac6]/20" />

          {STEPS.map(({ n, title, desc }) => (
            <div key={n} className="flex flex-col items-center text-center gap-5">
              <div className="relative z-10 flex h-[104px] w-[104px] items-center justify-center rounded-full border border-[#c3c6d7]/40 bg-white shadow-sm">
                <span className="text-4xl font-black text-[#004ac6]/15 select-none leading-none">
                  {n}
                </span>
                <div className="absolute inset-3 rounded-full border border-[#004ac6]/10" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-extrabold text-[#131b2e]">{title}</h3>
                <p className="text-sm text-[#505f76] leading-relaxed max-w-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 md:py-32 bg-[#080c18] relative overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, #7c3aed 0%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 md:px-10">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-[#a78bfa] mb-3">
              Social proof
            </p>
            <h2 className="text-3xl md:text-[44px] font-extrabold text-white leading-tight tracking-tight">
              Loved by organisers
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {TESTIMONIALS.map(({ quote, name, role, initials }) => (
              <div
                key={name}
                className="flex flex-col gap-5 rounded-3xl border border-white/8 bg-white/4 backdrop-blur-sm p-7"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-sm leading-none">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm text-white/65 leading-relaxed flex-1">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/8">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #004ac6, #7c3aed)",
                    }}
                  >
                    {initials}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white leading-none">
                      {name}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 md:py-32 px-4 bg-[#faf8ff]">
        <div
          className="max-w-3xl mx-auto relative rounded-3xl overflow-hidden text-center py-20 px-8 md:px-16"
          style={{ background: "linear-gradient(140deg, #080c18 0%, #0e1528 100%)" }}
        >
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] opacity-35 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse, #004ac6 0%, transparent 60%)",
              filter: "blur(70px)",
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/6">
              <Sparkles className="h-7 w-7 text-[#60a5fa]" />
            </div>
            <h2 className="text-3xl md:text-[48px] font-extrabold text-white leading-tight tracking-tight">
              {isLoggedIn
                ? "Create your next event"
                : "Start for free today"}
            </h2>
            <p className="text-base text-white/45 max-w-sm leading-relaxed">
              {isLoggedIn
                ? "Your dashboard is ready. Build something your guests will remember."
                : "No credit card. No setup fee. Your first event is live in under 2 minutes."}
            </p>
            <Link
              href={isLoggedIn ? "/events/new" : "/auth/sign-up"}
              className="flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-bold text-white transition-all hover:shadow-[0_0_50px_12px_rgba(0,74,198,0.35)] active:scale-95"
              style={{
                background: "linear-gradient(135deg, #004ac6 0%, #6d28d9 100%)",
              }}
            >
              {isLoggedIn ? "Create an event" : "Get started free"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {!isLoggedIn && (
              <p className="text-xs text-white/30">
                Already have an account?{" "}
                <Link href="/auth/sign-in" className="text-[#60a5fa] hover:underline">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
