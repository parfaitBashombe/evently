import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TipTapRenderer } from "@/components/tiptap-renderer";
import { LikeButton } from "@/components/like-button";
import { CommentSection } from "@/components/comment-section";
import { PublicRsvpForm } from "@/components/public-rsvp-form";
import { FaCalendarDays, FaLocationDot, FaUsers, FaTag, FaClock } from "react-icons/fa6";

export const dynamic = "force-dynamic";

function formatDate(iso: string | null, opts?: Intl.DateTimeFormatOptions) {
  if (!iso) return null;
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short", month: "long", day: "numeric",
    year: "numeric", hour: "2-digit", minute: "2-digit",
    ...opts,
  });
}

export default async function PublicEventPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const invite = await prisma.eventInvite.findFirst({
    where: { token },
    include: {
      event: {
        select: {
          id: true, title: true, content: true, description: true,
          coverImage: true, location: true, category: true, capacity: true,
          status: true, eventDate: true, endDate: true,
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
      <div className="flex flex-col items-center gap-4 py-32 text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 mb-2">
          <FaCalendarDays className="h-7 w-7 text-[#60a5fa]" />
        </div>
        <p className="text-xl font-bold text-white">This event isn&apos;t live yet.</p>
        <p className="text-base text-white/45">Check back soon or contact the organiser.</p>
      </div>
    );
  }

  const goingCount = event.rsvps.filter((r) => r.status === "going").length;
  const maybeCount = event.rsvps.filter((r) => r.status === "maybe").length;
  const totalRsvps = event.rsvps.length;
  const spotsLeft = event.capacity !== null ? Math.max(0, event.capacity - goingCount) : null;
  const isCancelled = event.status === "cancelled";

  return (
    <div className="flex flex-col">
      {/* Cover */}
      {event.coverImage ? (
        <div className="relative w-full overflow-hidden" style={{ height: "420px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.coverImage} alt={event.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080c18] via-[#080c18]/30 to-transparent" />
        </div>
      ) : (
        <div className="h-16 w-full" style={{ background: "linear-gradient(to bottom, rgba(0,74,198,0.15), transparent)" }} />
      )}

      {/* Content */}
      <div className="max-w-5xl mx-auto w-full px-4 md:px-10 py-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Left */}
          <div className="flex flex-col gap-6">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {event.status === "cancelled" && (
                <span className="rounded-full border border-red-500/30 bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-400">
                  Cancelled
                </span>
              )}
              {event.category && (
                <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-white/60">
                  <FaTag className="h-2.5 w-2.5" />
                  {event.category}
                </span>
              )}
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                {event.title}
              </h1>
              {event.description && (
                <p className="mt-3 text-base text-white/55 leading-relaxed">{event.description}</p>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-col gap-3">
              {event.eventDate && (
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#004ac6]/20">
                    <FaCalendarDays className="h-3.5 w-3.5 text-[#60a5fa]" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{formatDate(event.eventDate.toISOString())}</p>
                    {event.endDate && (
                      <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                        <FaClock className="h-3 w-3" />
                        Ends {formatDate(event.endDate.toISOString(), { weekday: undefined, year: undefined })}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#004ac6]/20">
                    <FaLocationDot className="h-3.5 w-3.5 text-[#60a5fa]" />
                  </span>
                  <span className="text-sm font-medium text-white">{event.location}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#004ac6]/20">
                  <FaUsers className="h-3.5 w-3.5 text-[#60a5fa]" />
                </span>
                <span className="text-sm text-white/55">
                  <span className="font-semibold text-emerald-400">{goingCount}</span>
                  {" going"}
                  {maybeCount > 0 && (
                    <> · <span className="font-semibold text-amber-400">{maybeCount}</span>{" maybe"}</>
                  )}
                  {spotsLeft !== null && (
                    <> · <span className="text-white/40">{spotsLeft} spots left</span></>
                  )}
                </span>
              </div>
            </div>

            {/* Capacity bar */}
            {event.capacity !== null && totalRsvps > 0 && (
              <div className="flex flex-col gap-1.5">
                <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[#004ac6] transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.round((goingCount / event.capacity) * 100))}%` }}
                  />
                </div>
                <p className="text-xs text-white/35">
                  {Math.min(100, Math.round((goingCount / event.capacity) * 100))}% capacity filled
                </p>
              </div>
            )}

            {/* Rich content */}
            {event.content && (
              <div className="border-t border-white/8 pt-6">
                <TipTapRenderer content={event.content} />
              </div>
            )}

            {/* Likes + comments */}
            <div className="flex items-center gap-4 border-t border-white/8 pt-4">
              <LikeButton token={token} initialCount={event._count.likes} />
              <span className="text-sm text-white/40">
                {event._count.comments} {event._count.comments === 1 ? "comment" : "comments"}
              </span>
            </div>

            <CommentSection token={token} initialCount={event._count.comments} />
          </div>

          {/* Right — RSVP */}
          <div className="lg:sticky lg:top-24 h-fit">
            {isCancelled ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
                <p className="font-bold text-red-400 text-lg">Event cancelled</p>
                <p className="mt-2 text-sm text-red-400/60">
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
