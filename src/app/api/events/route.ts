import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { parseEventJson } from "@/lib/api-utils";
import { countByStatus } from "@/lib/count-by-status";

export const GET = async () => {
  const session = await getSession();
  if (!session.data)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const rows = await prisma.event.findMany({
      where: { ownerUserId: session.data.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        coverImage: true,
        category: true,
        status: true,
        isPublic: true,
        eventDate: true,
        endDate: true,
        location: true,
        capacity: true,
        rsvps: { select: { status: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    const events = rows.map((row) => ({
      id: row.id,
      title: row.title,
      coverImage: row.coverImage,
      category: row.category,
      status: row.status,
      isPublic: row.isPublic,
      eventDate: row.eventDate?.toISOString() ?? null,
      endDate: row.endDate?.toISOString() ?? null,
      location: row.location,
      capacity: row.capacity,
      commentCount: row._count.comments,
      likeCount: row._count.likes,
      ...countByStatus(row.rsvps),
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch events", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  const session = await getSession();
  if (!session.data)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const body = await request.json();
    const input = parseEventJson(body);

    const created = await prisma.event.create({
      data: {
        ownerUserId: session.data.user.id,
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

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create event", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bad Request" },
      { status: 400 }
    );
  }
};
