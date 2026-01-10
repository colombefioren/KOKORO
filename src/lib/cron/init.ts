import { scheduleCleanupJobs } from "./cleanup-jobs";
import { initKeepAlive } from "./keep-alive";

export function initCronJobs() {
  console.log("Initializing cron jobs and keep-alive services...");

  const keepAliveService = initKeepAlive({
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL,
    intervalMinutes: process.env.KEEP_ALIVE_INTERVAL
      ? parseInt(process.env.KEEP_ALIVE_INTERVAL)
      : 10,
    verbose: process.env.NODE_ENV === "development",
  });

  if (process.env.ENABLE_CLEANUP_JOBS === "true") {
    scheduleCleanupJobs();
  }

  console.log("Cron jobs initialized");
  console.log("Keep-alive status:", keepAliveService.getStatus());

  return {
    keepAliveService,
  };
}

export function initServerlessCron() {
  console.log("Initializing serverless cron setup...");


  return {
    async pingHealth() {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
      if (!baseUrl) {
        console.error("No base URL configured for health ping");
        return;
      }

      try {
        const response = await fetch(`${baseUrl}/api/health`, {
          headers: { "X-Cron-Job": "true" },
        });
        console.log(`Health ping: ${response.status}`);
      } catch (error) {
        console.error("Health ping failed:", error);
      }
    },
  };
}
