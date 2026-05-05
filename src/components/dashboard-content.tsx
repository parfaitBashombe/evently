import { Button } from "./ui/button";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { RsvpStatus as PrismaRsvpStatus } from "@/app/generated/prisma/enums";
import { Badge } from "./ui/badge";
import { CreateEventModal } from "@/components/create-event-modal";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Users,
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  HelpCircle,
  XCircle,
} from "lucide-react";

export const countByStatus = (rsvps: { status: PrismaRsvpStatus }[]) => {
  let goingCount = 0;
  let maybeCount = 0;
  let notGoingCount = 0;

  for (const rsvp of rsvps) {
    if (rsvp.status === "going") goingCount += 1;
    else if (rsvp.status === "maybe") maybeCount += 1;
    else if (rsvp.status === "not_going") notGoingCount += 1;
  }

  return { goingCount, maybeCount, notGoingCount };
};

export const DashboardContent = async ({ userId }: { userId: string }) => {
  const rows = await prisma.event.findMany({
    where: { ownerUserId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      eventDate: true,
      location: true,
      rsvps: { select: { status: true } },
    },
  });

  const events = rows.map((row) => ({
    id: row.id,
    title: row.title,
    eventDate: row.eventDate ? row.eventDate.toISOString() : null,
    location: row.location,
    ...countByStatus(row.rsvps),
  }));

  const totalGoing = events.reduce((s, e) => s + e.goingCount, 0);
  const totalMaybe = events.reduce((s, e) => s + e.maybeCount, 0);
  const totalNotGoing = events.reduce((s, e) => s + e.notGoingCount, 0);

  return (
    <div className="flex flex-1 flex-col gap-10 pb-16">
      {/* ── Page header ── */}
      <div className="relative flex flex-wrap items-end justify-between gap-4 pt-10">
        {/* Decorative glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 -left-10 h-64 w-64 rounded-full blur-3xl opacity-10"
          style={{ background: "#955fff" }}
        />
        <div className="flex flex-col gap-1">
          <Badge variant="secondary" className="w-fit mb-1">
            Dashboard
          </Badge>
          <h1
            className="text-4xl font-black tracking-tight"
            style={{
              background: "linear-gradient(135deg, #ffffff 30%, #c084fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Your Events
          </h1>
          <p className="text-sm text-muted-foreground">
            Track attendee responses and manage invite links.
          </p>
        </div>

        <CreateEventModal />
      </div>

      {/* ── Stats bar (only when there are events) ── */}
      {events.length > 0 && (
        <section
          className="rounded-2xl px-8 py-8"
          style={{
            background: "rgba(149,95,255,0.06)",
            border: "1px solid rgba(149,95,255,0.15)",
          }}
        >
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: events.length, label: "Total events" },
              { value: totalGoing, label: "Going" },
              { value: totalMaybe, label: "Maybe" },
              { value: totalNotGoing, label: "Not going" },
            ].map(({ value, label }) => (
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
      )}

      {/* ── Event list ── */}
      {events.length === 0 ? (
        <div
          className="relative overflow-hidden rounded-2xl px-8 py-20 text-center"
          style={{
            background:
              "linear-gradient(135deg, #1a0f2e 0%, #16161f 60%, #0f1a2e 100%)",
            border: "1px solid rgba(149,95,255,0.2)",
          }}
        >
          {/* Glows */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-8 left-1/3 h-48 w-48 rounded-full blur-3xl opacity-25"
            style={{ background: "#955fff" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-8 right-1/3 h-48 w-48 rounded-full blur-3xl opacity-15"
            style={{ background: "#6366f1" }}
          />
          <div className="relative flex flex-col items-center gap-4">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "rgba(149,95,255,0.15)" }}
            >
              <CalendarPlus className="h-7 w-7 text-violet-400" />
            </span>
            <h2 className="text-2xl font-bold tracking-tight">No events yet</h2>
            <p className="max-w-sm text-muted-foreground text-sm">
              Create your first event and start collecting RSVPs in under a
              minute.
            </p>
            <div className="mt-2">
              <CreateEventModal />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {events.map((event) => {
            const total =
              event.goingCount + event.maybeCount + event.notGoingCount;
            const goingPct = total > 0 ? (event.goingCount / total) * 100 : 0;

            return (
              <Card
                key={event.id}
                className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Subtle top-edge glow on hover */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 -top-px h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #955fff, transparent)",
                  }}
                />

                <CardHeader className="gap-4 pb-3">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg leading-snug">
                      {event.title}
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="shrink-0"
                    >
                      <Link href={`/events/${event.id}`}>
                        Open
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>

                  {/* Date & location */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {event.eventDate && (
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-violet-400" />
                        {new Date(event.eventDate).toLocaleDateString(
                          undefined,
                          {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-violet-400" />
                        {event.location}
                      </span>
                    )}
                    {!event.eventDate && !event.location && (
                      <span className="italic opacity-50">
                        No date or location set
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-4 pt-0">
                  {/* RSVP pill row */}
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        background: "rgba(52,211,153,0.12)",
                        color: "#34d399",
                      }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {event.goingCount} Going
                    </span>
                    <span
                      className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        background: "rgba(251,191,36,0.12)",
                        color: "#fbbf24",
                      }}
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      {event.maybeCount} Maybe
                    </span>
                    <span
                      className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        background: "rgba(248,113,113,0.12)",
                        color: "#f87171",
                      }}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {event.notGoingCount} Not going
                    </span>
                  </div>

                  {/* Progress bar */}
                  {total > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {total} response
                          {total !== 1 ? "s" : ""}
                        </span>
                        <span>{Math.round(goingPct)}% going</span>
                      </div>
                      <div
                        className="h-1.5 w-full overflow-hidden rounded-full"
                        style={{ background: "rgba(255,255,255,0.07)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${goingPct}%`,
                            background:
                              "linear-gradient(90deg, #955fff, #34d399)",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
