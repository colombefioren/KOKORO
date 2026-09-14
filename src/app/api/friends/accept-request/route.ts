import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const requesterId = typeof body?.requesterId === "string" ? body.requesterId.trim() : "";

    if (!requesterId || requesterId.length > 100) {
      return NextResponse.json(
        { error: "Invalid requester ID" },
        { status: 400 }
      );
    }

    // Cannot accept your own request
    if (requesterId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot accept your own friend request" },
        { status: 400 }
      );
    }

    const receiverId = session.user.id;

    const friendship = await prisma.friendship.findFirst({
      where: {
        requesterId,
        receiverId,
        status: "PENDING",
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: "Friend request not found" },
        { status: 404 }
      );
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: "ACCEPTED" },
      include: {
        requester: true,
        receiver: true,
      },
    });

    return NextResponse.json(updatedFriendship, { status: 200 });
  } catch (err) {
    console.error("[POST /api/friends/accept-request] Error:", err);
    return NextResponse.json(
      { error: "Failed to accept friend request" },
      { status: 500 }
    );
  }
};
