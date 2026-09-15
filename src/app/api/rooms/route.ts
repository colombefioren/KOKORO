import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { publicUserSelect } from "@/lib/db/selects";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createRoomSchema } from "@/lib/validation/rooms";

export const GET = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rooms = await prisma.room.findMany({
      take: 100,
      orderBy: { updatedAt: "desc" },
      include: {
        members: { include: { user: { select: publicUserSelect } } },
      },
    });

    return NextResponse.json(rooms, { status: 200 });
  } catch (err) {
    console.error("[GET /api/rooms] Error:", err);
    return NextResponse.json({ error: "Failed to get rooms" }, { status: 500 });
  }
};

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createRoomSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const {
      name,
      description,
      thumbnailUrl,
      type,
      memberIds = [],
      maxMembers,
    } = parsed.data;
    const userId = session.user.id;

    const room = await prisma.room.create({
      data: {
        name,
        description,
        thumbnailUrl,
        type,
        maxMembers,
        createdBy: userId,
        members: {
          create: [
            { userId, role: "HOST" },
            ...memberIds.map((memberId) => ({
              userId: memberId,
              role: "MEMBER" as const,
            })),
          ],
        },
        chat: {
          create: {
            type: "ROOM",
            members: {
              create: [
                { userId },
                ...memberIds.map((memberId) => ({
                  userId: memberId,
                })),
              ],
            },
          },
        },
      },
      include: {
        members: { include: { user: { select: publicUserSelect } } },
        chat: {
          include: {
            members: { include: { user: { select: publicUserSelect } } },
          },
        },
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (err) {
    console.error("[POST /api/rooms] Error:", err);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 },
    );
  }
}
