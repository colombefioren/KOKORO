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

    const rooms = await prisma.room.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: { include: { user: true } },
        chat: true,
      },
    });

    return NextResponse.json(rooms, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to get rooms" }, { status: 500 });
  }
};
