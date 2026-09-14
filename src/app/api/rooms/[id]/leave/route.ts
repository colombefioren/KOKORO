import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const DELETE = async (
  _: Request,
  context: RouteContext<"/api/rooms/[id]/leave">
) => {
  const { id: roomId } = await context.params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    const membership = await prisma.roomMember.findFirst({
      where: { roomId, userId },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this room" },
        { status: 403 }
      );
    }

    if (membership.role === "HOST") {
      // Find the next member to promote (by join order)
      const nextHost = await prisma.roomMember.findFirst({
        where: {
          roomId,
          userId: { not: userId },
        },
        orderBy: { joinedAt: "asc" },
      });

      if (nextHost) {
        // Promote next member to HOST
        await prisma.roomMember.update({
          where: { id: nextHost.id },
          data: { role: "HOST" },
        });

        // Remove the current host
        await prisma.roomMember.delete({
          where: { id: membership.id },
        });

        // Also remove from chat via room relation
        const roomChats = await prisma.chat.findMany({
          where: { room: { id: roomId } },
          select: { id: true },
        });
        await prisma.chatMember.deleteMany({
          where: {
            chatId: { in: roomChats.map((c) => c.id) },
            userId,
          },
        });

        return NextResponse.json(
          {
            message: "You have left the room",
            newHostId: nextHost.userId,
          },
          { status: 200 }
        );
      } else {
        // No other members - delete the room entirely
        const room = await prisma.room.findUnique({
          where: { id: roomId },
          include: { chat: true },
        });

        if (room?.chatId) {
          await prisma.$transaction([
            prisma.messageUserDelete.deleteMany({
              where: { message: { chatId: room.chatId } },
            }),
            prisma.message.deleteMany({ where: { chatId: room.chatId } }),
            prisma.chatMember.deleteMany({ where: { chatId: room.chatId } }),
            prisma.roomMember.deleteMany({ where: { roomId } }),
            prisma.chat.delete({ where: { id: room.chatId } }),
            prisma.room.delete({ where: { id: roomId } }),
          ]);
        } else {
          await prisma.roomMember.deleteMany({ where: { roomId } });
          await prisma.room.delete({ where: { id: roomId } });
        }

        return NextResponse.json(
          { message: "Room deleted (no members remaining)" },
          { status: 200 }
        );
      }
    }

    // Non-host: simple delete
    await prisma.roomMember.delete({ where: { id: membership.id } });

    return NextResponse.json({ message: "You have left the room" }, { status: 200 });
  } catch (err) {
    console.error("[DELETE /api/rooms/[id]/leave] Error:", err);
    return NextResponse.json(
      { error: "Failed to leave room" },
      { status: 500 }
    );
  }
};
