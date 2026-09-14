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
    const rooms = await prisma.room.findMany({
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

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const {
      name,
      description,
      type,
      memberIds = [],
      maxMembers,
    } = await req.json();

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    const validTypes = ["PUBLIC", "PRIVATE", "FRIENDS"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid room type" }, { status: 400 });
    }

    if (maxMembers < 1 || maxMembers > 30) {
      return NextResponse.json(
        { error: "Max members must be between 1 and 30" },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        name,
        description,
        type,
        maxMembers,
        createdBy: userId,
        members: {
          create: [
            {
              userId,
              role: "HOST",
            },
            ...memberIds.map((memberId: string) => ({
              userId: memberId,
              role: "MEMBER",
            })),
          ],
        },
        chat: {
          create: {
            type: "ROOM",
            members: {
              create: [
                {
                  userId,
                },
                ...memberIds.map((memberId: string) => ({
                  userId: memberId,
                })),
              ],
            },
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        chat: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
