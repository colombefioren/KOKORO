import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const VALID_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉"];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ messageId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messageId } = await params;
  const { emoji } = await req.json();

  if (!emoji || !VALID_EMOJIS.includes(emoji)) {
    return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
  }

  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { chatId: true },
    });
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const membership = await prisma.chatMember.findFirst({
      where: { chatId: message.chatId, userId: session.user.id },
    });
    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this chat" },
        { status: 403 },
      );
    }

    const existing = await prisma.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId: session.user.id,
          emoji,
        },
      },
    });

    if (existing) {
      await prisma.messageReaction.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: "removed", emoji });
    }

    await prisma.messageReaction.create({
      data: {
        messageId,
        userId: session.user.id,
        emoji,
      },
    });

    return NextResponse.json({ action: "added", emoji });
  } catch (err) {
    console.error("[POST /api/messages/[messageId]/reactions] Error:", err);
    return NextResponse.json(
      { error: "Failed to toggle reaction" },
      { status: 500 },
    );
  }
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ messageId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messageId } = await params;

  try {
    const reactions = await prisma.messageReaction.findMany({
      where: { messageId },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    return NextResponse.json(reactions);
  } catch (err) {
    console.error("[GET /api/messages/[messageId]/reactions] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch reactions" },
      { status: 500 },
    );
  }
}
