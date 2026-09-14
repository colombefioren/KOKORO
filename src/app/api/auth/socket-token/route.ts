import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const GET = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    { token: session.session.token },
    { status: 200 }
  );
};
