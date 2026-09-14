import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const DELETE = async (
  _: Request,
  context : RouteContext<'/api/rooms/[id]/leave'>
) => {
  const{id: roomId} = await context.params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    const membership = await prisma.roomMember.findFirst({
      where: { roomId, userId },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this room" },
        { status: 403 }
      );
    }

    if (membership.role === "HOST") {
      return NextResponse.json(
        { error: "Hosts cannot leave the room" },
        { status: 403 }
      );
    }

    await prisma.roomMember.delete({
      where: { id: membership.id },
    });

    return NextResponse.json({ message: "You have left the room" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to leave room" }, { status: 500 });
  }
};
