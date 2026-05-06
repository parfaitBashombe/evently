import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const session = await getSession();
  if (!session.data) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: eventId } = await params;

  try {
    const owns = await prisma.event.findFirst({
      where: { id: eventId, ownerUserId: session.data.user.id },
      select: { id: true },
    });

    if (!owns) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const token = crypto.randomUUID().replace(/-/g, "");

    await prisma.eventInvite.upsert({
      where: { eventId },
      create: { eventId, token },
      update: { token },
    });

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error("Failed to create invite link", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
