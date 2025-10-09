import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";



export async function DELETE(req: Request, context: RouteContext<'/api/chats/[chatId]'>) {
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

    await prisma.chatMember.update({
      where: { id: membership.id },
      data: { deletedAt: new Date() },
    });

    await prisma.messageUserDelete.createMany({
      data: [
        {
          userId: session.user.id,
          chatId,
        },
      ],
      skipDuplicates: true,
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
