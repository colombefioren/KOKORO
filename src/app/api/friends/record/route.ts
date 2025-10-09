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
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      include: {
        requester: true,
        receiver: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(friendships, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch friendships:", error);
    return NextResponse.json(
      { error: "Failed to fetch friendships" },
      { status: 500 }
    );
  }
}
