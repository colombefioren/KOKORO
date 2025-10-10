import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  context : RouteContext<'/api/rooms/[id]/previous-video'>
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: roomId } = await  context.params;
    const { previousVideoId, currentVideoId } = await req.json();

    if (!previousVideoId) {
      return NextResponse.json(
        { error: "previousVideoId is required" },
        { status: 400 }
      );
    }

    const roomMember = await prisma.roomMember.findFirst({
      where: {
        roomId,
        userId: session.user.id,
      },
    });

    if (!roomMember) {
      return NextResponse.json(
        { error: "Not a member of this room" },
        { status: 403 }
      );
    }

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        previousVideoId,
        ...(currentVideoId && { currentVideoId }), 
      },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    return NextResponse.json(updatedRoom, { status: 200 });
  } catch (err) {
    console.error("[UPDATE_PREVIOUS_VIDEO] Error:", err);
    return NextResponse.json(
      { error: "Failed to update previous video" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { roomId } = await params;

    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      select: {
        previousVideoId: true,
        currentVideoId: true,
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json(room, { status: 200 });
  } catch (err) {
    console.error("[GET_PREVIOUS_VIDEO] Error:", err);
    return NextResponse.json(
      { error: "Failed to get previous video" },
      { status: 500 }
    );
  }
}