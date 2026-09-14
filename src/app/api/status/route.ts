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
    } catch (error) {
      dbStatus = "disconnected";
      console.error("Database connection error:", error);
    }

    const endTime = Date.now();
    const dbLatency = endTime - startTime;

    const status = {
      status: "operational",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      region: process.env.VERCEL_REGION || "unknown",
      database: {
        status: dbStatus,
        latency: `${dbLatency}ms`,
      },
      memory: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(
          process.memoryUsage().heapTotal / 1024 / 1024
        )}MB`,
        heapUsed: `${Math.round(
          process.memoryUsage().heapUsed / 1024 / 1024
        )}MB`,
        external: `${Math.round(
          process.memoryUsage().external / 1024 / 1024
        )}MB`,
      },
      system: {
        cpu: process.cpuUsage(),
        node: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };

    return NextResponse.json(status, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Status-Check": "true",
      },
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Failed to check system status",
      },
      { status: 500 }
    );
  }
}
