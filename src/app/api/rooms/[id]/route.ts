import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const PATCH = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const { id } = params;
    const data = await req.json();

    const room = await prisma.room.updateMany({
      where: {
        id,
        members: { some: { userId, role: "HOST" } },
      },
      data,
    });

    if (room.count === 0) {
      return NextResponse.json(
        { error: "Room not found or you are not the host" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  _req: Request,
  { params }: { params: { id: string } }
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const { id } = params;

    const room = await prisma.room.deleteMany({
      where: {
        id,
        members: { some: { userId, role: "HOST" } },
      },
    });

    if (room.count === 0) {
      return NextResponse.json(
        { error: "Room not found or you are not the host" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
};
