import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: RouteContext<"/api/chats/[chatId]">
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await context.params;

    const membership = await prisma.chatMember.findFirst({
      where: {
        chatId,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Chat not found or unauthorized" },
        { status: 404 }
      );
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        messages: {
          include: {
            sender: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(chat, { status: 200 });
  } catch (err) {
    console.error("[GET /api/chats/:chatId] Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: RouteContext<"/api/chats/[chatId]">
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { chatId } = await context.params;

    const membership = await prisma.chatMember.findFirst({
      where: {
        chatId,
        userId: session.user.id,
      },
    });

    if (!membership)
      return NextResponse.json(
        { error: "Chat not found or unauthorized" },
        { status: 404 }
      );

    const messages = await prisma.message.findMany({
      where: {
        chatId: chatId,
      },
      select: {
        id: true,
      },
    });

    await prisma.$transaction(async (tx) => {
      await tx.chatMember.update({
        where: { id: membership.id },
        data: { deletedAt: new Date() },
      });

      if (messages.length > 0) {
        await tx.messageUserDelete.createMany({
          data: messages.map((message) => ({
            userId: session.user.id,
            chatId: chatId,
            messageId: message.id,
          })),
          skipDuplicates: true,
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/chats/:chatId] Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
