import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("sendEmailVerification", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  describe("dev mode (no RESEND_API_KEY)", () => {
    it("logs verification URL and returns true", async () => {
      delete process.env.RESEND_API_KEY;
      process.env.NODE_ENV = "development";

      const { sendEmailVerification } = await import("../auth/email");
      const result = await sendEmailVerification(
        "test@example.com",
        "abc123",
        "John",
      );

      expect(result).toBe(true);
      // Should log the token/URL
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("abc123"),
      );
      // Should log the email address
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("test@example.com"),
      );
    });

    it("does not call fetch in dev mode", async () => {
      delete process.env.RESEND_API_KEY;
      process.env.NODE_ENV = "development";

      const { sendEmailVerification } = await import("../auth/email");
      await sendEmailVerification("test@example.com", "token");

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
