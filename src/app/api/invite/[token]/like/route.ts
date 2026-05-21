import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ token: string }> };

export const GET = async (request: NextRequest, { params }: Params) => {
  const { token } = await params;
  const fp = request.nextUrl.searchParams.get("fp") ?? "";

  try {
    const invite = await prisma.eventInvite.findFirst({
      where: { token },
      select: { eventId: true },
    });
    if (!invite)
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });

    const [count, existing] = await Promise.all([
      prisma.eventLike.count({ where: { eventId: invite.eventId } }),
      fp
        ? prisma.eventLike.findUnique({
            where: {
              eventId_fingerprint: { eventId: invite.eventId, fingerprint: fp },
            },
          })
        : null,
    ]);

    return NextResponse.json({ count, liked: Boolean(existing) });
  } catch (error) {
    console.error("Failed to fetch likes", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = async (request: NextRequest, { params }: Params) => {
  const { token } = await params;

  try {
    const { fingerprint } = await request.json();
    if (!fingerprint || typeof fingerprint !== "string") {
      return NextResponse.json({ error: "fingerprint required" }, { status: 400 });
    }

    const invite = await prisma.eventInvite.findFirst({
      where: { token },
      select: { eventId: true },
    });
    if (!invite)
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });

    const existing = await prisma.eventLike.findUnique({
      where: {
        eventId_fingerprint: { eventId: invite.eventId, fingerprint },
      },
    });

    if (existing) {
      await prisma.eventLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.eventLike.create({
        data: { eventId: invite.eventId, fingerprint },
      });
    }

    const count = await prisma.eventLike.count({
      where: { eventId: invite.eventId },
    });

    return NextResponse.json({ count, liked: !existing });
  } catch (error) {
    console.error("Failed to toggle like", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
