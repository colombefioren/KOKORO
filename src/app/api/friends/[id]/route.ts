import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export const GET = async (
  _request: Request,
  { params }: { params: { id: string } }
) => {
  const { id: userId } = await params;

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
        requester: true,
        receiver: true,
      },
    });

    const friends = friendships.map((f) =>
      f.requesterId === userId ? f.receiver : f.requester
    );

    return NextResponse.json(friends, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch friends" },
      { status: 500 }
    );
  }
};
