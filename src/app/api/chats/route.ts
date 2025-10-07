import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { type, memberIds, name } = await req.json();

    if (!type || !Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const uniqueMemberIds = Array.from(
      new Set([...memberIds, session.user.id])
    );

    if (type === "PRIVATE" && uniqueMemberIds.length === 2) {
      const existingChat = await prisma.chat.findFirst({
        where: {
          type: "PRIVATE",
          members: {
            every: {
              userId: { in: uniqueMemberIds },
            },
          },
        },
        include: { members: true },
      });

      if (
        existingChat &&
        existingChat.members.length === 2 &&
        uniqueMemberIds.every((id) =>
          existingChat.members.some((m) => m.userId === id)
        )
      ) {
        return NextResponse.json(existingChat);
      }
    }

    const chat = await prisma.chat.create({
      data: {
        type,
        name: type === "ROOM" ? name ?? "Room Chat" : name ?? null,
        members: {
          create: uniqueMemberIds.map((id) => ({
            userId: id,
          })),
        },
      },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    return NextResponse.json(chat);
  } catch (err) {
    console.error("[POST /api/chats] Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const chats = await prisma.chat.findMany({
      where: {
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

    return NextResponse.json(chats);
  } catch (err) {
    console.error("[GET /api/chats/all] Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
