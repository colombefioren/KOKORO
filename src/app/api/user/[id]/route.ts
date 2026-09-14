import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { toSafeUser } from "@/lib/sanitize";

export const GET = async (
  _req: Request,
  context: RouteContext<"/api/user/[id]">
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: userId } = await context.params;

    // Only allow viewing non-self users or self
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        username: true,
        displayUsername: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(toSafeUser(user), { status: 200 });
  } catch (err) {
    console.error("[GET /api/user/[id]] Error:", err);
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    );
  }
};
