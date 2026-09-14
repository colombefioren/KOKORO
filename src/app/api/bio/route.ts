import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { sanitizeUserInput } from "@/lib/sanitize";

export const POST = async (request: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Accept both string and { bio: string } formats
    const bioRaw = typeof body === "string" ? body : body?.bio;
    if (typeof bioRaw !== "string") {
      return NextResponse.json({ error: "Invalid bio format" }, { status: 400 });
    }

    const bio = sanitizeUserInput(bioRaw, 500);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { bio },
    });

    return NextResponse.json(
      { success: "Bio updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[POST /api/bio] Error:", err);
    return NextResponse.json(
      { error: "Failed to update bio" },
      { status: 500 }
    );
  }
};
