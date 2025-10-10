import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  context: RouteContext<"/api/rooms/[id]">
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        members: { include: { user: true } },
        chat: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(room, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}

export const PATCH = async (
  req: Request,
  context: RouteContext<'/api/rooms/[id]'>
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { id } = await context.params;

  try {
    const data = await req.json();

    const isHost = await prisma.roomMember.findFirst({
      where: {
        roomId: id,
        userId,
        role: "HOST",
      },
    });

    if (!isHost) {
      return NextResponse.json(
        { error: "You are not authorized to update this room" },
        { status: 403 }
      );
    }

    const room = await prisma.room.findUnique({
      where: { id },
      include: { chat: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    await prisma.room.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        isActive: data.isActive,
        maxMembers: data.maxMembers,
      },
    });

    if (Array.isArray(data.memberIds)) {
      const host = await prisma.roomMember.findFirst({
        where: { roomId: id, role: "HOST" },
        select: { userId: true },
      });

      const hostId = host?.userId;
      const sanitizedNewIds = data.memberIds.filter(
        (uid: string) => uid !== hostId
      );

      const currentMembers = await prisma.roomMember.findMany({
        where: { roomId: id, role: "MEMBER" },
        select: { userId: true },
      });

      const currentIds = currentMembers.map((m) => m.userId);

      const toRemove = currentIds.filter(
        (uid) => !sanitizedNewIds.includes(uid)
      );
      const toAdd = sanitizedNewIds.filter(
        (uid: string) => !currentIds.includes(uid)
      );

      if (toRemove.length > 0) {
        await prisma.$transaction([
          prisma.roomMember.deleteMany({
            where: {
              roomId: id,
              userId: { in: toRemove },
              role: "MEMBER",
            },
          }),
          prisma.chatMember.deleteMany({
            where: {
              chatId: room.chatId!,
              userId: { in: toRemove },
            },
          }),
        ]);
      }

      if (toAdd.length > 0) {
        const validUsers = await prisma.user.findMany({
          where: { id: { in: toAdd } },
          select: { id: true },
        });

        if (validUsers.length > 0) {
          await prisma.$transaction([
            prisma.roomMember.createMany({
              data: validUsers.map((u) => ({
                userId: u.id,
                roomId: id,
                role: "MEMBER",
              })),
              skipDuplicates: true,
            }),
            prisma.chatMember.createMany({
              data: validUsers.map((u) => ({
                userId: u.id,
                chatId: room.chatId!,
              })),
              skipDuplicates: true,
            }),
          ]);
        }
      }
    }

    const updatedRoom = await prisma.room.findUnique({
      where: { id },
      include: {
        members: { include: { user: true } },
        chat: {
          include: {
            members: { include: { user: true } },
          },
        },
      },
    });

    return NextResponse.json(updatedRoom, { status: 200 });
  } catch (err) {
    console.error("[PATCH /api/rooms/[id]] Error:", err);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  _req: Request,
  context: RouteContext<'/api/rooms/[id]'>
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const { id } = await context.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: { chat: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const isHost = await prisma.roomMember.findFirst({
      where: {
        roomId: id,
        userId,
        role: "HOST",
      },
    });

    if (!isHost) {
      return NextResponse.json(
        { error: "You are not authorized to delete this room" },
        { status: 403 }
      );
    }

    await prisma.$transaction([
      prisma.messageUserDelete.deleteMany({
        where: {
          message: {
            chatId: room.chatId!,
          },
        },
      }),
      prisma.message.deleteMany({
        where: {
          chatId: room.chatId!,
        },
      }),
      prisma.chatMember.deleteMany({
        where: {
          chatId: room.chatId!,
        },
      }),
      prisma.roomMember.deleteMany({
        where: {
          roomId: id,
        },
      }),
      prisma.chat.delete({
        where: {
          id: room.chatId!,
        },
      }),
      prisma.room.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
};
