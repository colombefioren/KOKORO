import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roomId = await params.id;

    const room = await prisma.room.findFirst({
      where: {
        id: roomId,
        members: {
          some: { userId },
        },
      },
      include: { members: true },
    });

    if (!room) {
      return NextResponse.json(
        { error: "You are not a member of this room" },
        { status: 403 }
      );
    }

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: { isFavorite: !room.isFavorite },
    });

    return NextResponse.json(updatedRoom, { status: 200 });
  } catch (err) {
    console.error("[PATCH /rooms/:id/favorite] Error:", err);
    return NextResponse.json(
      { error: "Failed to update favorite status" },
      { status: 500 }
    );
  }
}
