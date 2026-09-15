import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  context: RouteContext<"/api/rooms/[id]/activity">,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: roomId } = await context.params;

  const membership = await prisma.roomMember.findFirst({
    where: { roomId, userId: session.user.id },
  });
  if (!membership) {
    return NextResponse.json(
      { error: "You are not a member of this room" },
      { status: 403 },
    );
  }

  try {
    const activities = await prisma.roomActivity.findMany({
      where: { roomId },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(activities, { status: 200 });
  } catch (err) {
    console.error("[GET /api/rooms/[id]/activity] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  context: RouteContext<"/api/rooms/[id]/activity">,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: roomId } = await context.params;
  const { action, details } = await req.json();

  const VALID_ACTIONS = [
    "VIDEO_CHANGED",
    "VIDEO_PAUSED",
    "VIDEO_RESUMED",
    "MEMBER_JOINED",
    "MEMBER_LEFT",
    "ROLE_CHANGED",
    "ROOM_UPDATED",
    "MODE_CHANGED",
  ];

  if (!action || !VALID_ACTIONS.includes(action)) {
    return NextResponse.json(
      { error: "A valid action is required" },
      { status: 400 },
    );
  }

  const membership = await prisma.roomMember.findFirst({
    where: { roomId, userId: session.user.id },
  });
  if (!membership) {
    return NextResponse.json(
      { error: "You are not a member of this room" },
      { status: 403 },
    );
  }

  try {
    const activity = await prisma.roomActivity.create({
      data: {
        roomId,
        userId: session.user.id,
        action,
        details: details || undefined,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (err) {
    console.error("[POST /api/rooms/[id]/activity] Error:", err);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 },
    );
  }
}
