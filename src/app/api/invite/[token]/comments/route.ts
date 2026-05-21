import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseComment } from "@/lib/api-utils";

type Params = { params: Promise<{ token: string }> };

export const GET = async (_req: NextRequest, { params }: Params) => {
  const { token } = await params;

  try {
    const invite = await prisma.eventInvite.findFirst({
      where: { token },
      select: { eventId: true },
    });
    if (!invite)
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });

    const comments = await prisma.eventComment.findMany({
      where: { eventId: invite.eventId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, content: true, createdAt: true },
    });

    return NextResponse.json(
      comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))
    );
  } catch (error) {
    console.error("Failed to fetch comments", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const POST = async (request: NextRequest, { params }: Params) => {
  const { token } = await params;

  try {
    const invite = await prisma.eventInvite.findFirst({
      where: { token },
      select: { eventId: true },
    });
    if (!invite)
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });

    const body = await request.json();
    const input = parseComment(body);

    const comment = await prisma.eventComment.create({
      data: { eventId: invite.eventId, name: input.name, content: input.content },
      select: { id: true, name: true, content: true, createdAt: true },
    });

    return NextResponse.json(
      { ...comment, createdAt: comment.createdAt.toISOString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to post comment", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bad Request" },
      { status: 400 }
    );
  }
};
