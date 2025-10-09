import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export const GET = async (
  _req: Request,
  context:  RouteContext<'/api/rooms/[id]/hosted'>
) => {
  const { id: userId } = await context.params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const hostedRooms = await prisma.room.findMany({
      where: {
        members: {
          some: {
            userId,
            role: "HOST",
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

    return NextResponse.json(hostedRooms, { status: 200 });
  } catch (err) {
    console.error("Failed to fetch hosted rooms:", err);
    return NextResponse.json(
      { error: "Failed to fetch hosted rooms" },
      { status: 500 }
    );
  }
};
