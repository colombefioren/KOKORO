import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const bio : string = await request.json();

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {  bio },
    });

    return NextResponse.json(
      { success: "Bio updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update bio" },
      { status: 500 }
    );
  }
};
