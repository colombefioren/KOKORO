import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { publicUserSelect } from "@/lib/db/selects";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const GET = async (
  _req: Request,
  context: RouteContext<"/api/rooms/[id]/hosted">,
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

  const viewerId = session.user.id;

  try {
    const isFriend =
      viewerId === userId
        ? true
        : (await prisma.friendship.findFirst({
            where: {
              status: "ACCEPTED",
              OR: [
                { requesterId: viewerId, receiverId: userId },
                { requesterId: userId, receiverId: viewerId },
              ],
            },
            select: { id: true },
          })) !== null;

    const hostedRooms = await prisma.room.findMany({
      where: {
        members: { some: { userId, role: "HOST" } },
        OR: [
          { type: "PUBLIC" },
          ...(isFriend ? [{ type: "FRIENDS" as const }] : []),
          { members: { some: { userId: viewerId } } },
        ],
      },
      include: {
        members: {
          include: {
            user: { select: publicUserSelect },
          },
        },
      },
    });

    return NextResponse.json(hostedRooms, { status: 200 });
  } catch (err) {
    console.error("Failed to fetch hosted rooms:", err);
    return NextResponse.json(
      { error: "Failed to fetch hosted rooms" },
      { status: 500 },
    );
  }
};
