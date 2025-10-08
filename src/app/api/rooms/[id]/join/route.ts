import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { id: roomId } = await params;

  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const existingMember = room.members.find(
      (member) => member.userId === userId
    );
    if (existingMember) {
      return NextResponse.json(
        { error: "Already a member of this room" },
        { status: 400 }
      );
    }

    if (room.members.length >= (room.maxMembers || 30)) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 });
    }

    if (room.type === "PRIVATE") {
      return NextResponse.json(
        { error: "Cannot join private room" },
        { status: 403 }
      );
    }

    if (room.type === "FRIENDS") {
      const host = await prisma.roomMember.findFirst({
        where: {
          roomId,
          role: "HOST",
        },
        include: {
          user: true,
        },
      });

      if (host) {
        const isFriend = await prisma.friendship.findFirst({
          where: {
            OR: [
              {
                requesterId: userId,
                receiverId: host.userId,
                status: "ACCEPTED",
              },
              {
                requesterId: host.userId,
                receiverId: userId,
                status: "ACCEPTED",
              },
            ],
          },
        });

        if (!isFriend) {
          return NextResponse.json(
            { error: "Must be friends with room host to join" },
            { status: 403 }
          );
        }
      }
    }

    await prisma.roomMember.create({
      data: {
        userId,
        roomId,
        role: "MEMBER",
      },
    });

    await prisma.chatMember.create({
      data: {
        userId,
        chatId: room.chatId!,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[POST /api/rooms/[id]/join] Error:", err);
    return NextResponse.json({ error: "Failed to join room right now" }, { status: 500 });
  }
}
