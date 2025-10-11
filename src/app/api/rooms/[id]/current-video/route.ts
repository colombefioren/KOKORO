import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  context: RouteContext<"/api/rooms/[id]/current-video">
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id:roomId } = await context.params;
    const { currentVideoId } = await req.json();

    if (!currentVideoId) {
      return NextResponse.json(
        { error: "currentVideoId is required" },
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
        currentVideoId,
      },
    });

    return NextResponse.json(updatedRoom, { status: 200 });
  } catch (err) {
    console.error("[UPDATE_CURRENT_VIDEO] Error:", err);
    return NextResponse.json(
      { error: "Failed to update current video" },
      { status: 500 }
    );
  }
}
