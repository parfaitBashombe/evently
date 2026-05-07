import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const GET = async ({
  params,
}: {
  params: Promise<{ token: string }>;
}) => {
  try {
    const { token } = await params;
    const row = await prisma.eventInvite.findFirst({
      where: { token },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            eventDate: true,
          },
        },
      },
    });

    if (!row) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    const eventRow = row.event;
    const event = {
      title: eventRow.title,
      description: eventRow.description,
      location: eventRow.location,
      eventDate: eventRow.eventDate ? eventRow.eventDate.toISOString() : null,
    };

    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    console.error("Error fetching invite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};
