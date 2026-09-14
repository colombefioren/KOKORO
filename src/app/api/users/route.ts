import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { toSafeUsers } from "@/lib/sanitize";

export const GET = async (request: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json([], { status: 200 });
    }

    // Limit query length
    const sanitizedQuery = query.slice(0, 100);

    const users = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
        OR: [
          { name: { contains: sanitizedQuery, mode: "insensitive" } },
          { username: { contains: sanitizedQuery, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        image: true,
        username: true,
        displayUsername: true,
        bio: true,
        createdAt: true,
      },
      take: 20, // Limit results
    });

    return NextResponse.json(toSafeUsers(users), { status: 200 });
  } catch (err) {
    console.error("[GET /api/users] Error:", err);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
};
