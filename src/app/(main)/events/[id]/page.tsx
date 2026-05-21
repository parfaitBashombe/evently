import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { EventManagement } from "@/components/event-management";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

function computeRsvpByDay(
  rsvps: Array<{ status: string; respondedAt: Date }>
) {
  const map = new Map<
    string,
    { going: number; maybe: number; notGoing: number; total: number }
  >();
  for (const rsvp of rsvps) {
    const date = rsvp.respondedAt.toISOString().split("T")[0];
    const entry = map.get(date) ?? { going: 0, maybe: 0, notGoing: 0, total: 0 };
    if (rsvp.status === "going") entry.going++;
    else if (rsvp.status === "maybe") entry.maybe++;
    else entry.notGoing++;
    entry.total++;
    map.set(date, entry);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }));
}

export default async function EventManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session.data) redirect("/auth/sign-in");

  const { id } = await params;

  const event = await prisma.event.findFirst({
    where: { id, ownerUserId: session.data.user.id },
    select: {
      id: true,
      title: true,
      description: true,
      coverImage: true,
      location: true,
      category: true,
      capacity: true,
      status: true,
      isPublic: true,
      eventDate: true,
      endDate: true,
      invite: { select: { token: true } },
      rsvps: {
        orderBy: { respondedAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          message: true,
          respondedAt: true,
        },
      },
      _count: { select: { comments: true, likes: true } },
    },
  });

  if (!event) notFound();

  const goingCount = event.rsvps.filter((r) => r.status === "going").length;
  const maybeCount = event.rsvps.filter((r) => r.status === "maybe").length;
  const notGoingCount = event.rsvps.filter((r) => r.status === "not_going").length;
  const rsvpByDay = computeRsvpByDay(event.rsvps);

  return (
    <div className="flex flex-col gap-6 pb-16">
      <Link
        href="/dashboard"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Dashboard
      </Link>

      <EventManagement
        event={{
          id: event.id,
          title: event.title,
          description: event.description,
          coverImage: event.coverImage,
          location: event.location,
          category: event.category,
          capacity: event.capacity,
          status: event.status,
          isPublic: event.isPublic,
          eventDate: event.eventDate?.toISOString() ?? null,
          endDate: event.endDate?.toISOString() ?? null,
          inviteToken: event.invite?.token ?? null,
          goingCount,
          maybeCount,
          notGoingCount,
          commentCount: event._count.comments,
          likeCount: event._count.likes,
          rsvps: event.rsvps.map((r) => ({
            ...r,
            respondedAt: r.respondedAt.toISOString(),
          })),
          rsvpByDay,
        }}
      />
    </div>
  );
}
