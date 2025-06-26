/**
 * Cloudflare Worker for scheduled article cleanup
 * This worker runs on a cron schedule and calls the cleanup API endpoint
 */

export interface Env {
  CRON_TARGET_URL: string;
  CRON_SECRET?: string;
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    const targetUrl = env.CRON_TARGET_URL;
    console.log("Target URL for cleanup:", targetUrl);

    if (!targetUrl) {
      console.error("CRON_TARGET_URL environment variable is not set");
      return;
    }

    try {
      console.log(
        `Starting scheduled article cleanup at ${new Date().toISOString()}`
      );

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add secret header if configured
      if (env.CRON_SECRET) {
        headers["x-cron-secret"] = env.CRON_SECRET;
      }

      const response = await fetch(targetUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          cron: controller.cron,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("Cleanup completed successfully:", result);
    } catch (error) {
      console.error("Error during scheduled cleanup:", error);
      // In production, you might want to send alerts or notifications here
    }
  },
} satisfies ExportedHandler<Env>;
