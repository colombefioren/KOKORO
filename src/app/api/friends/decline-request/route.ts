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

  const { friendId }: { friendId: string } = await req.json();

  if (!friendId) {
    return NextResponse.json(
      { error: "friendId is required" },
      { status: 400 }
    );
  }

  try {
    const friendship = await prisma.friendship.findFirst({
      where: {
        id: friendId,
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
      { success: true, message: "Friendship removed or request declined" },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to remove friend or decline request" },
      { status: 500 }
    );
  }
};
