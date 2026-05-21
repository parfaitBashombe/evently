import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { parseEventJson } from "@/lib/api-utils";
import { countByStatus } from "@/lib/count-by-status";

type Params = { params: Promise<{ id: string }> };

export const GET = async (_req: Request, { params }: Params) => {
  const session = await getSession();
  if (!session.data)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;

  try {
    const event = await prisma.event.findFirst({
      where: { id, ownerUserId: session.data.user.id },
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
        isPublic: true,
        eventDate: true,
        endDate: true,
        invite: { select: { token: true } },
        rsvps: {
          orderBy: { respondedAt: "desc" },
          select: { id: true, name: true, email: true, status: true, message: true, respondedAt: true },
        },
        _count: { select: { comments: true, likes: true } },
      },
    });

    if (!event)
      return NextResponse.json({ error: "Event not found" }, { status: 404 });

    return NextResponse.json({
      ...event,
      eventDate: event.eventDate?.toISOString() ?? null,
      endDate: event.endDate?.toISOString() ?? null,
      inviteToken: event.invite?.token ?? null,
      commentCount: event._count.comments,
      likeCount: event._count.likes,
      rsvps: event.rsvps.map((r) => ({ ...r, respondedAt: r.respondedAt.toISOString() })),
      ...countByStatus(event.rsvps),
    });
  } catch (error) {
    console.error("Failed to fetch event", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const PUT = async (request: Request, { params }: Params) => {
  const session = await getSession();
  if (!session.data)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;

  try {
    const owns = await prisma.event.findFirst({
      where: { id, ownerUserId: session.data.user.id },
      select: { id: true },
    });
    if (!owns)
      return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const body = await request.json();
    const input = parseEventJson(body);

    await prisma.event.update({
      where: { id },
      data: {
        title: input.title,
        content: input.content,
        description: input.description,
        coverImage: input.coverImage,
        location: input.location,
        category: input.category,
        capacity: input.capacity ?? null,
        status: input.status ?? "draft",
        isPublic: input.isPublic ?? false,
        eventDate: input.eventDate ? new Date(input.eventDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update event", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bad Request" },
      { status: 400 }
    );
  }
};

export const DELETE = async (_req: Request, { params }: Params) => {
  const session = await getSession();
  if (!session.data)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;

  try {
    const owns = await prisma.event.findFirst({
      where: { id, ownerUserId: session.data.user.id },
      select: { id: true },
    });
    if (!owns)
      return NextResponse.json({ error: "Event not found" }, { status: 404 });

    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete event", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bad Request" },
      { status: 400 }
    );
  }
};
