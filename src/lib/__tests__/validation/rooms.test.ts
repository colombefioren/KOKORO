import { describe, it, expect } from "vitest";
import {
  createRoomSchema,
  updateRoomSchema,
  updateCurrentVideoSchema,
  updatePreviousVideoSchema,
  roomParamsSchema,
} from "../../validation/rooms";

describe("createRoomSchema", () => {
  it("accepts valid room data", () => {
    const result = createRoomSchema.safeParse({
      name: "My Room",
      type: "PUBLIC",
    });
    expect(result.success).toBe(true);
  });

  it("accepts room with all optional fields", () => {
    const result = createRoomSchema.safeParse({
      name: "My Room",
      description: "A cool room",
      type: "PRIVATE",
      memberIds: ["user1", "user2"],
      maxMembers: 10,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createRoomSchema.safeParse({ name: "", type: "PUBLIC" });
    expect(result.success).toBe(false);
  });

  it("rejects name > 100 chars", () => {
    const result = createRoomSchema.safeParse({
      name: "a".repeat(101),
      type: "PUBLIC",
    });
    expect(result.success).toBe(false);
  });

  it("rejects description > 500 chars", () => {
    const result = createRoomSchema.safeParse({
      name: "Room",
      description: "a".repeat(501),
      type: "PUBLIC",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid room type", () => {
    const result = createRoomSchema.safeParse({
      name: "Room",
      type: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid room types", () => {
    for (const type of ["PUBLIC", "PRIVATE", "FRIENDS"]) {
      const result = createRoomSchema.safeParse({ name: "Room", type });
      expect(result.success).toBe(true);
    }
  });

  it("rejects maxMembers < 2", () => {
    const result = createRoomSchema.safeParse({
      name: "Room",
      type: "PUBLIC",
      maxMembers: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects maxMembers > 30", () => {
    const result = createRoomSchema.safeParse({
      name: "Room",
      type: "PUBLIC",
      maxMembers: 31,
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 29 memberIds", () => {
    const result = createRoomSchema.safeParse({
      name: "Room",
      type: "PUBLIC",
      memberIds: Array.from({ length: 30 }, (_, i) => `user${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing type", () => {
    const result = createRoomSchema.safeParse({ name: "Room" });
    expect(result.success).toBe(false);
  });
});

describe("updateRoomSchema", () => {
  it("accepts partial updates", () => {
    expect(updateRoomSchema.safeParse({ name: "New Name" }).success).toBe(true);
  });

  it("accepts empty update (all optional)", () => {
    expect(updateRoomSchema.safeParse({}).success).toBe(true);
  });

  it("accepts nullable description", () => {
    expect(updateRoomSchema.safeParse({ description: null }).success).toBe(
      true,
    );
  });

  it("accepts nullable maxMembers", () => {
    expect(updateRoomSchema.safeParse({ maxMembers: null }).success).toBe(true);
  });

  it("accepts an absolute thumbnail URL", () => {
    expect(
      updateRoomSchema.safeParse({
        thumbnailUrl:
          "https://example.supabase.co/storage/v1/object/public/room-thumbnail/a.png",
      }).success,
    ).toBe(true);
  });

  it("accepts a bundled room cover path", () => {
    expect(
      updateRoomSchema.safeParse({
        thumbnailUrl: "/room-covers/cover-001.webp",
      }).success,
    ).toBe(true);
  });

  it("rejects other relative thumbnail paths", () => {
    for (const thumbnailUrl of [
      "/etc/passwd",
      "/room-covers/../secret.webp",
      "room-covers/cover-001.webp",
      "javascript:alert(1)",
    ]) {
      expect(updateRoomSchema.safeParse({ thumbnailUrl }).success).toBe(false);
    }
  });
});

describe("updateCurrentVideoSchema", () => {
  it("accepts valid video update", () => {
    const result = updateCurrentVideoSchema.safeParse({
      currentVideoId: "dQw4w9WgXcQ",
    });
    expect(result.success).toBe(true);
  });

  it("accepts with title", () => {
    const result = updateCurrentVideoSchema.safeParse({
      currentVideoId: "dQw4w9WgXcQ",
      title: "Rick Astley",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty currentVideoId", () => {
    const result = updateCurrentVideoSchema.safeParse({ currentVideoId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects title > 200 chars", () => {
    const result = updateCurrentVideoSchema.safeParse({
      currentVideoId: "dQw4w9WgXcQ",
      title: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

describe("updatePreviousVideoSchema", () => {
  it("accepts valid data", () => {
    const result = updatePreviousVideoSchema.safeParse({
      previousVideoId: "dQw4w9WgXcQ",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty previousVideoId", () => {
    const result = updatePreviousVideoSchema.safeParse({
      previousVideoId: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("roomParamsSchema", () => {
  it("accepts valid room ID", () => {
    expect(roomParamsSchema.safeParse({ id: "abc123" }).success).toBe(true);
  });

  it("rejects empty room ID", () => {
    expect(roomParamsSchema.safeParse({ id: "" }).success).toBe(false);
  });
});
