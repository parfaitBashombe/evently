import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TipTapRenderer } from "@/components/tiptap-renderer";
import { LikeButton } from "@/components/like-button";
import { CommentSection } from "@/components/comment-section";
import { PublicRsvpForm } from "@/components/public-rsvp-form";
import {
  CalendarDays,
  MapPin,
  Users,
  Tag,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_BADGE = {
  draft: "hidden",
  published: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
};

function formatDate(iso: string | null, opts?: Intl.DateTimeFormatOptions) {
  if (!iso) return null;
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...opts,
  });
}

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invite = await prisma.eventInvite.findFirst({
    where: { token },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          content: true,
          description: true,
          coverImage: true,
          location: true,
          category: true,
          capacity: true,
          status: true,
          eventDate: true,
          endDate: true,
          _count: { select: { comments: true, likes: true } },
          rsvps: { select: { status: true } },
        },
      },
    },
  });

  if (!invite) notFound();

  const event = invite.event;

  if (event.status === "draft") {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-lg font-semibold">This event isn&apos;t live yet.</p>
        <p className="text-sm text-muted-foreground">
          Check back soon or contact the organiser.
        </p>
      </div>
    );
  }

  const goingCount = event.rsvps.filter((r) => r.status === "going").length;
  const maybeCount = event.rsvps.filter((r) => r.status === "maybe").length;
  const totalRsvps = event.rsvps.length;
  const spotsLeft =
    event.capacity !== null ? Math.max(0, event.capacity - goingCount) : null;

  const isCancelled = event.status === "cancelled";

  return (
    /* Break out of the root layout's px-4 max-w-5xl container */
    <div className="-mx-4 -mt-10">
      {/* Cover image */}
      {event.coverImage ? (
        <div className="relative w-full overflow-hidden" style={{ height: "380px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.coverImage}
            alt={event.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
      ) : (
        <div className="h-24 w-full bg-gradient-to-b from-violet-500/5 to-transparent" />
      )}

      {/* Main content */}
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid gap-8 py-8 lg:grid-cols-[1fr_340px]">
          {/* ── Left: event info ── */}
          <div className="flex flex-col gap-6">
            {/* Status + category */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[event.status]}`}
              >
                {event.status}
              </span>
              {event.category && (
                <span className="flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-400">
                  <Tag className="h-3 w-3" />
                  {event.category}
                </span>
              )}
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                {event.title}
              </h1>
              {event.description && (
                <p className="mt-2 text-base text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>

            {/* Meta info */}
            <div className="flex flex-col gap-2.5 text-sm">
              {event.eventDate && (
                <div className="flex items-start gap-2.5">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                  <div>
                    <p className="font-medium">
                      {formatDate(event.eventDate.toISOString())}
                    </p>
                    {event.endDate && (
                      <p className="text-muted-foreground text-xs mt-0.5">
                        <Clock className="inline h-3 w-3 mr-1" />
                        Ends {formatDate(event.endDate.toISOString(), { weekday: undefined, year: undefined })}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 shrink-0 text-violet-400" />
                  <span>{event.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 shrink-0 text-violet-400" />
                <span>
                  <span className="font-medium text-emerald-400">{goingCount}</span>
                  {" going"}
                  {maybeCount > 0 && (
                    <> · <span className="font-medium text-amber-400">{maybeCount}</span> maybe</>
                  )}
                  {spotsLeft !== null && (
                    <> · <span className="text-muted-foreground">{spotsLeft} spots left</span></>
                  )}
                </span>
              </div>
            </div>

            {/* Capacity bar */}
            {event.capacity !== null && totalRsvps > 0 && (
              <div className="flex flex-col gap-1.5">
                <div
                  className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-border"
                >
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all duration-700"
                    style={{
                      width: `${Math.min(100, Math.round((goingCount / event.capacity) * 100))}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.min(100, Math.round((goingCount / event.capacity) * 100))}% capacity filled
                </p>
              </div>
            )}

            {/* Rich content */}
            {event.content && (
              <div className="border-t border-border pt-6">
                <TipTapRenderer content={event.content} />
              </div>
            )}

            {/* Likes + comments count */}
            <div className="flex items-center gap-3 border-t border-border pt-4">
              <LikeButton token={token} initialCount={event._count.likes} />
              <span className="text-sm text-muted-foreground">
                {event._count.comments}{" "}
                {event._count.comments === 1 ? "comment" : "comments"}
              </span>
            </div>

            {/* Comments */}
            <CommentSection token={token} initialCount={event._count.comments} />
          </div>

          {/* ── Right: RSVP sidebar ── */}
          <div className="lg:sticky lg:top-20 h-fit">
            {isCancelled ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-center">
                <p className="font-semibold text-red-400">Event cancelled</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This event has been cancelled by the organiser.
                </p>
              </div>
            ) : (
              <PublicRsvpForm token={token} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
