import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const startTime = Date.now();

    let dbStatus = "connected";
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = "disconnected";
    }

    const dbLatency = Date.now() - startTime;

    return NextResponse.json(
      {
        status: dbStatus === "connected" ? "operational" : "degraded",
        timestamp: new Date().toISOString(),
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`,
        },
      },
      {
        status: dbStatus === "connected" ? 200 : 503,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { status: "error", timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
