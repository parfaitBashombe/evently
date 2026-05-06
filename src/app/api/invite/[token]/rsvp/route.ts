import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseRsvp } from "@/lib/api-utils";
import { RsvpStatus } from "@/app/generated/prisma/enums";

export const POST = async (request: Request, { params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params;

  try {
    const formData = await request.formData();
    const input = parseRsvp(formData);

    const invite = await prisma.eventInvite.findFirst({
      where: { token },
      select: {
        id: true,
        event: {
          select: { id: true },
        },
      },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite link is invalid." }, { status: 404 });
    }

    const eventId = invite.event.id;
    const emailNormalized = input.email.toLowerCase();

    await prisma.eventRsvp.upsert({
      where: {
        eventId_emailNormalized: {
          eventId,
          emailNormalized,
        },
      },
      create: {
        eventId,
        inviteId: invite.id,
        name: input.name,
        email: input.email,
        emailNormalized,
        status: input.status as RsvpStatus,
      },
      update: {
        name: input.name,
        status: input.status as RsvpStatus,
        respondedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to submit RSVP", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Bad Request" }, { status: 400 });
  }
}
