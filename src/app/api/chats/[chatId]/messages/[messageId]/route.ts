import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  context: RouteContext<"/api/chats/[chatId]/messages/[messageId]">,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatId, messageId } = await context.params;
  const userId = session.user.id;
  const scope = new URL(req.url).searchParams.get("scope") ?? "me";

  try {
    const isMember = await prisma.chatMember.findFirst({
      where: { chatId, userId, deletedAt: null },
    });
    if (!isMember) {
      return NextResponse.json(
        { error: "You are not a member of this chat" },
        { status: 403 },
      );
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { chatId: true, senderId: true },
    });
    if (!message || message.chatId !== chatId) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (scope === "both") {
      if (message.senderId !== userId) {
        return NextResponse.json(
          { error: "Only the sender can delete for everyone" },
          { status: 403 },
        );
      }
      await prisma.message.update({
        where: { id: messageId },
        data: { deletedAt: new Date(), content: null, imageUrl: null },
      });
      return NextResponse.json({ success: true, scope: "both" });
    }

    await prisma.messageUserDelete.upsert({
      where: { userId_messageId: { userId, messageId } },
      create: { userId, messageId, chatId },
      update: {},
    });
    return NextResponse.json({ success: true, scope: "me" });
  } catch (err) {
    console.error(
      "[DELETE /api/chats/:chatId/messages/:messageId] Error:",
      err,
    );
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 },
    );
  }
}
