import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { toSafeUsers } from "@/lib/sanitize";

export const GET = async (
  _request: Request,
  context: RouteContext<"/api/friends/[id]">,
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: userId } = await context.params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
            displayUsername: true,
            bio: true,
            createdAt: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
            displayUsername: true,
            bio: true,
            createdAt: true,
          },
        },
      },
    });

    const friends = friendships.map((f) =>
      f.requesterId === userId ? f.receiver : f.requester,
    );

    return NextResponse.json(toSafeUsers(friends), { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch friends" },
      { status: 500 },
    );
  }
};
