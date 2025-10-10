import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";



export async function GET(req: Request, context : RouteContext<'/api/chats/[chatId]/messages'>) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { chatId } = await context.params;

    const messages = await prisma.message.findMany({
      where: {
        chatId,
        deletedFor: {
          none: {
            userId: session.user.id,
          },
        },
      },
      include: {
        sender: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (err) {
    console.error("[GET /api/chats/:chatId/messages] Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  context: RouteContext<'/api/chats/[chatId]/messages'>
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { chatId } = await context.params;
    const { content, imageUrl } = await req.json();

    if (!content && !imageUrl)
      return NextResponse.json(
        { error: "Message must have content or image" },
        { status: 400 }
      );

    const isMember = await prisma.chatMember.findFirst({
      where: { chatId, userId: session.user.id, deletedAt: null },
    });

    if (!isMember)
      return NextResponse.json(
        { error: "You are not a member of this chat" },
        { status: 403 }
      );

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: session.user.id,
        content,
        imageUrl,
      },
      include: {
        sender: true,
      },
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    console.error("[POST /api/chats/:chatId/messages] Error:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}