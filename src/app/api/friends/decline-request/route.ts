import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const DELETE = async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const friendId = typeof body?.friendId === "string" ? body.friendId.trim() : "";

    if (!friendId || friendId.length > 100) {
      return NextResponse.json(
        { error: "Invalid friend ID" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, receiverId: friendId },
          { requesterId: friendId, receiverId: userId },
        ],
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: "Friendship not found" },
        { status: 404 }
      );
    }

    await prisma.friendship.delete({ where: { id: friendship.id } });

    return NextResponse.json(
      { message: "Friend request declined successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[DELETE /api/friends/decline-request] Error:", err);
    return NextResponse.json(
      { error: "Failed to remove friend or decline request" },
      { status: 500 }
    );
  }
};
