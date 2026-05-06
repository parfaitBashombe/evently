import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { parseEventFields } from "@/lib/api-utils";
import { countByStatus } from "@/lib/count-by-status";

export const GET = async () => {
  const session = await getSession();
  if (!session.data) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.data.user.id;

  try {
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

    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch events", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const POST = async (request: Request) => {
  const session = await getSession();
  if (!session.data) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const input = parseEventFields(formData);

    const created = await prisma.event.create({
      data: {
        ownerUserId: session.data.user.id,
        title: input.title,
        description: input.description,
        location: input.location,
        eventDate: input.eventDate ? new Date(input.eventDate) : null,
      },
    });

    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create event", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Bad Request" }, { status: 400 });
  }
}
