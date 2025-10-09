import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(
  _req: Request,
  context: RouteContext<"/api/rooms/[id]/favorite">
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: roomId } = await context.params;

    const roomMember = await prisma.roomMember.findFirst({
      where: {
        roomId: roomId,
        userId: userId,
      },
    });

    if (!roomMember) {
      return NextResponse.json(
        { error: "You are not a member of this room" },
        { status: 403 }
      );
    }

    const updatedMember = await prisma.roomMember.update({
      where: {
        id: roomMember.id,
      },
      data: {
        isFavorite: !roomMember.isFavorite,
      },
      include: {
        room: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedMember.room, { status: 200 });
  } catch (err) {
    console.error("[PATCH /rooms/:id/favorite] Error:", err);
    return NextResponse.json(
      { error: "Failed to update favorite status" },
      { status: 500 }
    );
  }
}
