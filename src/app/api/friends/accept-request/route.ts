import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { friendshipId } : { friendshipId: string } = (await req.json()) ;

  if (!friendshipId) {
    return NextResponse.json(
      { error: "friendshipId is required" },
      { status: 400 }
    );
  }

  try {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship || friendship.receiverId !== session.user.id) {
      return NextResponse.json(
        { error: "Friend request not found or unauthorized" },
        { status: 404 }
      );
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "ACCEPTED" },
    });

    return NextResponse.json(updatedFriendship, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to accept friend request" },
      { status: 500 }
    );
  }
};
