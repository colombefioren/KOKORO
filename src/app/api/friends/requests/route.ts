import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const GET = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    const pendingRequests = await prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
      include: {
        requester: true,
      },
    });
    
    const requests = pendingRequests.map((f) => ({
      ...f.requester,
      receivedAt: f.createdAt,
    }));

    return NextResponse.json(requests, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to get pending friend requests" },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { receiverId }: { receiverId: string } = await req.json();

  if (!receiverId) {
    return NextResponse.json({ error: "receiverId is required" }, { status: 400 });
  }

  const requesterId = session.user.id;

  if (requesterId === receiverId) {
    return NextResponse.json({ error: "You cannot send a friend request to yourself" }, { status: 400 });
  }

  try {
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, receiverId },
          { requesterId: receiverId, receiverId: requesterId },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json({ error: "Friend request already exists or you are already friends" }, { status: 400 });
    }

    const friendship = await prisma.friendship.create({
      data: {
        requesterId,
        receiverId,
        status: "PENDING",
      },
      include: {
        requester: true,
      },
    });

    const responseData = {
      ...friendship.requester,
      receivedAt: friendship.createdAt,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send friend request" }, { status: 500 });
  }
};
