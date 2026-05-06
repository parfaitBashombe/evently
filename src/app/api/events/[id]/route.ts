import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { parseEventFields } from "@/lib/api-utils";
import { countByStatus } from "@/lib/count-by-status";

export const GET = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await getSession();
  if (!session.data) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  
  const { id } = await params;

  try {
    const event = await prisma.event.findFirst({
      where: {
        id,
        ownerUserId: session.data.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        eventDate: true,
        invite: {
          select: {
            token: true,
          },
        },
        rsvps: {
          orderBy: {
            respondedAt: "desc",
          },
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            respondedAt: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const counts = countByStatus(event.rsvps);

    const eventDetail = {
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      eventDate: event.eventDate ? event.eventDate.toISOString() : null,
      inviteToken: event.invite?.token ?? null,
      rsvps: event.rsvps.map((rsvp) => ({
        ...rsvp,
        respondedAt: rsvp.respondedAt.toISOString(),
      })),
      ...counts,
    };

    return NextResponse.json(eventDetail);
  } catch (error) {
    console.error("Failed to fetch event detail", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const PUT = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await getSession();
  if (!session.data) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const owns = await prisma.event.findFirst({
      where: { id, ownerUserId: session.data.user.id },
      select: { id: true },
    });

    if (!owns) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const input = parseEventFields(formData);

    await prisma.event.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        location: input.location,
        eventDate: input.eventDate ? new Date(input.eventDate) : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update event", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Bad Request" }, { status: 400 });
  }
}

export const DELETE = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const session = await getSession();
  if (!session.data) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const owns = await prisma.event.findFirst({
      where: { id, ownerUserId: session.data.user.id },
      select: { id: true },
    });

    if (!owns) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete event", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Bad Request" }, { status: 400 });
  }
}
