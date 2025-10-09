import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { otherUserId } = await req.json();

    if (!otherUserId) {
      return NextResponse.json(
        { error: "otherUserId is required" },
        { status: 400 }
      );
    }

    const currentUserId = session.user.id;

    const existingChats = await prisma.chat.findMany({
      where: {
        type: "PRIVATE",
        members: {
          some: {
            userId: currentUserId,
          },
        },
      },
      include: {
        members: true,
      },
    });

    const targetChat = existingChats.find(
      (chat) =>
        chat.members.some((m) => m.userId === currentUserId) &&
        chat.members.some((m) => m.userId === otherUserId)
    );

    if (targetChat) {
      const userMembership = targetChat.members.find(
        (m) => m.userId === currentUserId
      );

      if (userMembership?.deletedAt) {
        await prisma.chatMember.update({
          where: { id: userMembership.id },
          data: { deletedAt: null },
        });

        await prisma.messageUserDelete.deleteMany({
          where: {
            userId: currentUserId,
            chatId: targetChat.id,
          },
        });
      }

      return NextResponse.json(targetChat);
    }

    const newChat = await prisma.chat.create({
      data: {
        type: "PRIVATE",
        members: {
          create: [{ userId: currentUserId }, { userId: otherUserId }],
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        messages: true,
      },
    });

    return NextResponse.json(newChat);
  } catch (err) {
    console.error("[POST /api/chats/find-or-restore] Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
