import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const privateChats = await prisma.chat.findMany({
      where: {
        type: "PRIVATE",
        members: {
          some: {
            userId: session.user.id,
            deletedAt: null,
          },
        },
      },
      include: {
        members: {
          include: { user: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: { sender: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(privateChats);
  } catch (err) {
    console.error("[GET /api/chats/private] Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
