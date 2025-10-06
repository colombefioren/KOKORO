import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const DELETE = async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { requesterId }: { requesterId: string } = await req.json();

  if (!requesterId) {
    return NextResponse.json(
      { error: "requesterId is required" },
      { status: 400 }
    );
  }

  try {
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

    await prisma.friendship.delete({
      where: { id: friendship.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to decline friend request" },
      { status: 500 }
    );
  }
};
