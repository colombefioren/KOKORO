interface KeepAliveConfig {
  /**
   * @default process.env.NEXT_PUBLIC_APP_URL
   */
  baseUrl: string;

  /**
   * interval between pings in minutes
   * @default 10
   */
  intervalMinutes: number;

  /**
   * endpoints to ping
   * @default ['/api/health', '/api/status']
   */
  endpoints: string[];

  /**
   * @default process.env.NODE_ENV === 'development'
   */
  verbose: boolean;
}

const defaultConfig: KeepAliveConfig = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  intervalMinutes: 10,
  endpoints: ["/api/health", "/api/status"],
  verbose: process.env.NODE_ENV === "development",
};

export class KeepAliveService {
  private config: KeepAliveConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private isActive = false;
  private lastPingTime: Date | null = null;

  constructor(config: Partial<KeepAliveConfig> = {}) {
    this.config = { ...defaultConfig, ...config };

    if (!this.config.baseUrl) {
      throw new Error("Base URL is required for KeepAliveService");
    }


    this.config.baseUrl = this.config.baseUrl.replace(/\/$/, "");
  }

  start(): void {
    if (this.isActive) {
      this.log("Service is already running");
      return;
    }

    this.isActive = true;
    this.log(`Starting keep-alive service for ${this.config.baseUrl}`);
    this.log(`Will ping every ${this.config.intervalMinutes} minutes`);

    this.pingEndpoints();

    const intervalMs = this.config.intervalMinutes * 60 * 1000;
    this.intervalId = setInterval(() => {
      this.pingEndpoints();
    }, intervalMs);

    process.on("SIGTERM", () => this.stop());
    process.on("SIGINT", () => this.stop());
  }


  stop(): void {
    if (!this.isActive) return;

    this.isActive = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.log("Keep-alive service stopped");
  }

  private async pingEndpoints(): Promise<void> {
    const promises = this.config.endpoints.map((endpoint) =>
      this.ping(`${this.config.baseUrl}${endpoint}`)
    );

    try {
      await Promise.allSettled(promises);
      this.lastPingTime = new Date();
      this.log(
        `Successfully pinged all endpoints at ${this.lastPingTime.toISOString()}`
      );
    } catch (error) {
      this.log(`Error pinging endpoints: ${error}`, "error");
    }
  }


  private async ping(url: string): Promise<void> {
    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Render-KeepAlive/1.0",
          "X-Keep-Alive": "true",
        },
        signal: AbortSignal.timeout(30000),
      });

      const endTime = Date.now();
      const latency = endTime - startTime;

      if (response.ok) {
        this.log(`✓ ${url} - ${response.status} (${latency}ms)`);
      } else {
        this.log(`✗ ${url} - ${response.status} (${latency}ms)`, "warn");
      }
    } catch (error) {
      this.log(`✗ ${url} - Error: ${error}`, "error");
      throw error;
    }
  }

  getStatus() {
    return {
      isActive: this.isActive,
      lastPingTime: this.lastPingTime,
      config: {
        baseUrl: this.config.baseUrl,
        intervalMinutes: this.config.intervalMinutes,
        endpoints: this.config.endpoints,
      },
    };
  }

  private log(message: string, level: "log" | "warn" | "error" = "log"): void {
    if (!this.config.verbose && level === "log") return;

    const timestamp = new Date().toISOString();
    const prefix = `[KeepAlive ${timestamp}]`;

    switch (level) {
      case "warn":
        console.warn(`${prefix} ${message}`);
        break;
      case "error":
        console.error(`${prefix} ${message}`);
        break;
      default:
        console.log(`${prefix} ${message}`);
    }
  }
}

let keepAliveInstance: KeepAliveService | null = null;


export function getKeepAliveService(
  config?: Partial<KeepAliveConfig>
): KeepAliveService {
  if (!keepAliveInstance) {
    keepAliveInstance = new KeepAliveService(config);
  }
  return keepAliveInstance;
}


export function initKeepAlive(
  config?: Partial<KeepAliveConfig>
): KeepAliveService {
  const service = getKeepAliveService(config);

  const isRender = process.env.RENDER === "true";
  const shouldStart = process.env.NODE_ENV === "production" && isRender;

  if (shouldStart && process.env.DISABLE_KEEP_ALIVE !== "true") {
    service.start();
  } else {
    console.log(
      "Keep-alive service not started (development mode or disabled)"
    );
  }

  return service;
}
