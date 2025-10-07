import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";



export async function GET(req: Request, { params }: { params: { chatId: string } }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { chatId } = params;

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
