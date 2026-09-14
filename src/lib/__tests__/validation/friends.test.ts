import { describe, it, expect } from "vitest";
import {
  sendFriendRequestSchema,
  acceptFriendRequestSchema,
  declineFriendRequestSchema,
  friendParamsSchema,
} from "../../validation/friends";

describe("sendFriendRequestSchema", () => {
  it("accepts valid receiverId", () => {
    const result = sendFriendRequestSchema.safeParse({ receiverId: "user123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty receiverId", () => {
    const result = sendFriendRequestSchema.safeParse({ receiverId: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing receiverId", () => {
    const result = sendFriendRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("acceptFriendRequestSchema", () => {
  it("accepts valid requesterId", () => {
    const result = acceptFriendRequestSchema.safeParse({
      requesterId: "user123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty requesterId", () => {
    const result = acceptFriendRequestSchema.safeParse({ requesterId: "" });
    expect(result.success).toBe(false);
  });
});

describe("declineFriendRequestSchema", () => {
  it("accepts valid friendId", () => {
    const result = declineFriendRequestSchema.safeParse({
      friendId: "user123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty friendId", () => {
    const result = declineFriendRequestSchema.safeParse({ friendId: "" });
    expect(result.success).toBe(false);
  });
});

describe("friendParamsSchema", () => {
  it("accepts valid id", () => {
    expect(friendParamsSchema.safeParse({ id: "abc" }).success).toBe(true);
  });

  it("rejects empty id", () => {
    expect(friendParamsSchema.safeParse({ id: "" }).success).toBe(false);
  });
});
