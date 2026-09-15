import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";

export async function DELETE(
  _req: Request,
  context: RouteContext<"/api/rooms/[id]/members/[userId]">,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: roomId, userId: targetUserId } = await context.params;
  const currentUserId = session.user.id;

  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { chatId: true },
    });
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (targetUserId !== currentUserId) {
      const isHost = await prisma.roomMember.findFirst({
        where: { roomId, userId: currentUserId, role: "HOST" },
      });
      if (!isHost) {
        return NextResponse.json(
          { error: "Only the host can remove members" },
          { status: 403 },
        );
      }
    }

    const target = await prisma.roomMember.findFirst({
      where: { roomId, userId: targetUserId },
    });
    if (!target) {
      return NextResponse.json(
        { error: "User is not a member of this room" },
        { status: 404 },
      );
    }
    if (target.role === "HOST") {
      return NextResponse.json(
        { error: "Transfer host to another member before removing them" },
        { status: 400 },
      );
    }

    await prisma.$transaction([
      prisma.roomMember.delete({ where: { id: target.id } }),
      ...(room.chatId
        ? [
            prisma.chatMember.updateMany({
              where: { chatId: room.chatId, userId: targetUserId },
              data: { deletedAt: new Date() },
            }),
          ]
        : []),
      prisma.roomActivity.create({
        data: {
          roomId,
          userId: currentUserId,
          action: "MEMBER_LEFT",
          details: { targetUserId },
        },
      }),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[DELETE /api/rooms/[id]/members/[userId]] Error:", err);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 },
    );
  }
}
