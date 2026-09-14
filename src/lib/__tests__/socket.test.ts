import { describe, it, expect } from "vitest";

describe("Socket Manager exports", () => {
  it("exports getSocket function", async () => {
    const mod = await import("../socket");
    expect(typeof mod.getSocket).toBe("function");
  });

  it("exports disconnectSocket function", async () => {
    const mod = await import("../socket");
    expect(typeof mod.disconnectSocket).toBe("function");
  });
});
