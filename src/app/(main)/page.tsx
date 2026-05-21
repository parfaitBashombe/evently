import Link from "next/link";
import {
  CalendarPlus,
  Link2,
  BarChart3,
  MessageSquare,
  Heart,
  FileText,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ImageIcon,
  CalendarDays,
  MapPin,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/server";

const FEATURES = [
  { icon: CalendarPlus, title: "Rich event pages", description: "Write detailed descriptions with a full WYSIWYG editor — headings, lists, images, and more.", accent: "text-violet-400 bg-violet-500/10" },
  { icon: Link2, title: "Shareable invite links", description: "Every event gets a public page. Share the link — guests RSVP with no account needed.", accent: "text-sky-400 bg-sky-500/10" },
  { icon: Users, title: "RSVP management", description: "Going, Maybe, or Can't go. Guests leave a message. You see it all in a searchable table.", accent: "text-emerald-400 bg-emerald-500/10" },
  { icon: BarChart3, title: "Live analytics", description: "Response breakdowns, capacity tracking, RSVPs over time — all on your event dashboard.", accent: "text-amber-400 bg-amber-500/10" },
  { icon: MessageSquare, title: "Comments", description: "Guests can leave public comments on your event page to ask questions or share excitement.", accent: "text-pink-400 bg-pink-500/10" },
  { icon: Heart, title: "Likes", description: "Guests can like events anonymously — no account required. Shows social proof on the page.", accent: "text-rose-400 bg-rose-500/10" },
  { icon: ImageIcon, title: "Cover images", description: "Upload a banner image or paste a URL. Your event page looks professional instantly.", accent: "text-teal-400 bg-teal-500/10" },
  { icon: FileText, title: "Categories", description: "Tag events as Conference, Workshop, Party, and more — keep your dashboard organised.", accent: "text-indigo-400 bg-indigo-500/10" },
];

const STEPS = [
  { number: "01", title: "Create your event", description: "Set a title, upload a banner, write your description, and set capacity." },
  { number: "02", title: "Publish & share", description: "Flip to Published and copy your unique invite link. Share it anywhere." },
  { number: "03", title: "Manage responses", description: "Watch RSVPs come in live. Search attendees, export CSV, track analytics." },
];

const TESTIMONIALS = [
  { quote: "I used Evently for our company hackathon. Had 80 RSVPs in the first hour.", name: "Sarah K.", role: "Engineering Manager" },
  { quote: "The analytics tab is incredibly useful — I knew exactly how full we'd be a week out.", name: "Marcus T.", role: "Community Organiser" },
  { quote: "Guests love that they don't need an account. Zero friction.", name: "Léa D.", role: "Event Planner" },
];

const Home = async () => {
  let isLoggedIn = false;
  try {
    const session = await getSession();
    isLoggedIn = Boolean(session.data);
  } catch {
    isLoggedIn = false;
  }

  // Fetch public published events for the discovery section
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
    <div className="flex flex-1 flex-col gap-28 pb-20">
      {/* Hero */}
      <section className="flex flex-col items-start gap-7 pt-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/5 px-3 py-1 text-xs text-violet-400">
          <Sparkles className="h-3 w-3" />
          WYSIWYG · Analytics · Comments · Likes
        </div>
        <h1 className="max-w-2xl text-5xl font-bold tracking-tight leading-[1.1] sm:text-6xl">
          The event platform{" "}
          <span style={{ background: "linear-gradient(135deg, #c4b5fd 10%, #8b5cf6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            built for organisers.
          </span>
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground leading-relaxed">
          Create beautiful event pages, collect RSVPs, track analytics, and engage your audience — all from one clean dashboard. No account needed for guests.
        </p>
        {isLoggedIn ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" asChild><Link href="/dashboard">Go to Dashboard<ArrowRight className="h-4 w-4" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/events/new">Create an event</Link></Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" asChild><Link href="/auth/sign-up">Get started free<ArrowRight className="h-4 w-4" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/auth/sign-in">Sign in</Link></Button>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
          {["Free to use", "No credit card", "Guests don't need accounts", "Export CSV"].map((item) => (
            <span key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />{item}
            </span>
          ))}
        </div>
      </section>

      {/* Discover Events — only shown if there are public events */}
      {publicEvents.length > 0 && (
        <section className="flex flex-col gap-8">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-widest text-violet-400">
                Discover
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">Upcoming events</h2>
              <p className="text-sm text-muted-foreground">
                Open events you can RSVP to — no account needed.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publicEvents.map((ev) => {
              const goingCount = ev.rsvps.filter((r) => r.status === "going").length;
              const totalRsvps = ev.rsvps.length;
              const spotsLeft = ev.capacity !== null ? Math.max(0, ev.capacity - goingCount) : null;
              const token = ev.invite?.token;

              return (
                <Link
                  key={ev.id}
                  href={token ? `/e/${token}` : "#"}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-violet-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20"
                >
                  {/* Cover image */}
                  {ev.coverImage ? (
                    <div className="aspect-video w-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ev.coverImage}
                        alt={ev.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-gradient-to-br from-violet-500/10 to-transparent flex items-center justify-center">
                      <CalendarDays className="h-10 w-10 text-violet-500/20" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex flex-col gap-2 p-4">
                    {ev.category && (
                      <span className="flex w-fit items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-400">
                        <Tag className="h-2.5 w-2.5" />
                        {ev.category}
                      </span>
                    )}
                    <h3 className="font-semibold leading-snug line-clamp-2">{ev.title}</h3>
                    {ev.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {ev.description}
                      </p>
                    )}
                    <div className="flex flex-col gap-1 mt-1 text-xs text-muted-foreground">
                      {ev.eventDate && (
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-3 w-3 text-violet-400 shrink-0" />
                          {new Date(ev.eventDate).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                      {ev.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-violet-400 shrink-0" />
                          {ev.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {goingCount > 0 ? (
                        <><span className="text-emerald-400 font-medium">{goingCount}</span> going</>
                      ) : totalRsvps === 0 ? (
                        "Be the first to RSVP"
                      ) : (
                        `${totalRsvps} responses`
                      )}
                    </span>
                    {spotsLeft !== null && (
                      <span className={spotsLeft === 0 ? "text-red-400" : ""}>
                        {spotsLeft === 0 ? "Full" : `${spotsLeft} spots left`}
                      </span>
                    )}
                    {spotsLeft === null && token && (
                      <span className="text-violet-400 group-hover:underline">RSVP →</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Features grid */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-widest text-violet-400">Features</p>
          <h2 className="text-2xl font-semibold tracking-tight">Everything an organiser needs</h2>
          <p className="text-sm text-muted-foreground max-w-lg">From rich event descriptions to live response analytics, Evently has the full stack of tools you need to run successful events.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description, accent }) => (
            <div key={title} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:border-violet-500/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-widest text-violet-400">How it works</p>
          <h2 className="text-2xl font-semibold tracking-tight">From idea to live event in minutes</h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map(({ number, title, description }) => (
            <div key={number} className="flex flex-col gap-3">
              <span className="text-5xl font-black tabular-nums tracking-tighter" style={{ background: "linear-gradient(135deg, oklch(0.606 0.248 292 / 0.4), oklch(0.606 0.248 292 / 0.1))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {number}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-widest text-violet-400">What people say</p>
          <h2 className="text-2xl font-semibold tracking-tight">Trusted by organisers</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, role }) => (
            <div key={name} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground leading-relaxed">&ldquo;{quote}&rdquo;</p>
              <div className="mt-auto flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/15 text-xs font-bold text-violet-400">{name[0]}</span>
                <div>
                  <p className="text-sm font-medium leading-none">{name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden flex flex-col items-center gap-6 rounded-2xl border border-border bg-card px-8 py-16 text-center">
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 0%, oklch(0.606 0.248 292 / 0.12), transparent)" }} />
        <div className="relative flex flex-col gap-2 max-w-lg">
          <h2 className="text-3xl font-bold tracking-tight">{isLoggedIn ? "Create your next event" : "Start planning today"}</h2>
          <p className="text-muted-foreground">{isLoggedIn ? "Your dashboard is waiting. Build something great." : "Free account. No credit card. Your guests don't need one either."}</p>
        </div>
        <div className="relative flex flex-wrap items-center justify-center gap-3">
          {isLoggedIn ? (
            <>
              <Button size="lg" asChild><Link href="/events/new">Create event<ArrowRight className="h-4 w-4" /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link href="/dashboard">Dashboard</Link></Button>
            </>
          ) : (
            <>
              <Button size="lg" asChild><Link href="/auth/sign-up">Create free account<ArrowRight className="h-4 w-4" /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link href="/auth/sign-in">Sign in</Link></Button>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
