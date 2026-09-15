import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { canControlRoom } from "@/lib/rooms/can-control";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { updateCurrentVideoSchema } from "@/lib/validation/rooms";

export async function PUT(
  req: Request,
  context: RouteContext<"/api/rooms/[id]/current-video">,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: roomId } = await context.params;
    const body = await req.json();
    const parsed = updateCurrentVideoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const canControl = await canControlRoom(roomId, session.user.id);
    if (!canControl) {
      return NextResponse.json(
        { error: "You are not authorized to control this room" },
        { status: 403 },
      );
    }

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        currentVideoId: parsed.data.currentVideoId,
        videoSource: parsed.data.videoSource ?? "YOUTUBE",
      },
    });

    return NextResponse.json(updatedRoom, { status: 200 });
  } catch (err) {
    console.error("[PUT /api/rooms/[id]/current-video] Error:", err);
    return NextResponse.json(
      { error: "Failed to update current video" },
      { status: 500 },
    );
  }
}
