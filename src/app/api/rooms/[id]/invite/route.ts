import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";

export async function POST(
  req: Request,
  context: RouteContext<"/api/rooms/[id]/invite">,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { id: roomId } = await context.params;

  try {
    const body = await req.json();
    const inviteeId = body?.inviteeId as string | undefined;

    if (!inviteeId || typeof inviteeId !== "string") {
      return NextResponse.json(
        { error: "inviteeId is required" },
        { status: 400 },
      );
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { members: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const isMember = room.members.some((m) => m.userId === userId);
    if (!isMember) {
      return NextResponse.json(
        { error: "You are not a member of this room" },
        { status: 403 },
      );
    }

    if (room.members.some((m) => m.userId === inviteeId)) {
      return NextResponse.json(
        { error: "User is already a member of this room" },
        { status: 400 },
      );
    }

    const invitee = await prisma.user.findUnique({
      where: { id: inviteeId },
      select: { id: true },
    });

    if (!invitee) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const invite = await prisma.roomInvite.upsert({
      where: { roomId_inviteeId: { roomId, inviteeId } },
      create: {
        roomId,
        inviterId: userId,
        inviteeId,
        status: "PENDING",
      },
      update: {
        inviterId: userId,
        status: "PENDING",
      },
    });

    return NextResponse.json(invite, { status: 200 });
  } catch (err) {
    console.error("[POST /api/rooms/[id]/invite] Error:", err);
    return NextResponse.json(
      { error: "Failed to send invite" },
      { status: 500 },
    );
  }
}
