import prisma from "@/lib/db/prisma";

export function scheduleCleanupJobs() {
  const CLEANUP_INTERVAL = 60 * 60 * 1000;

  console.log("Scheduling cleanup jobs...");

  runCleanupTasks();

  const cleanupInterval = setInterval(runCleanupTasks, CLEANUP_INTERVAL);

  process.on("SIGTERM", () => {
    clearInterval(cleanupInterval);
    console.log("Cleanup jobs stopped");
  });

  process.on("SIGINT", () => {
    clearInterval(cleanupInterval);
    console.log("Cleanup jobs stopped");
  });

  return cleanupInterval;
}

async function runCleanupTasks() {
  const startTime = Date.now();
  console.log(`Starting cleanup tasks at ${new Date().toISOString()}`);

  try {
    const results = await Promise.allSettled([
      cleanupExpiredSessions(),
    ]);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`Cleanup completed in ${duration}ms`);

    results.forEach((result, index) => {
      const taskNames = [
        "Verification Tokens",
        "Expired Sessions",
        "Old Messages",
      ];

      if (result.status === "fulfilled") {
        console.log(`  ✓ ${taskNames[index]}: ${result.value.count || "done"}`);
      } else {
        console.log(`  ✗ ${taskNames[index]}: ${result.reason}`);
      }
    });
  } catch (error) {
    console.error(" Cleanup tasks failed:", error);
  }
}

async function cleanupExpiredSessions() {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });

  return { count: result.count, type: "sessions" };
}
