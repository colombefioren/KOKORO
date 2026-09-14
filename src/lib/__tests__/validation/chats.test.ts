import { describe, it, expect } from "vitest";
import {
  createChatSchema,
  sendMessageSchema,
  findOrRestoreChatSchema,
  chatParamsSchema,
} from "../../validation/chats";

describe("createChatSchema", () => {
  it("accepts valid private chat", () => {
    const result = createChatSchema.safeParse({
      type: "PRIVATE",
      memberIds: ["user1", "user2"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid room chat with name", () => {
    const result = createChatSchema.safeParse({
      type: "ROOM",
      memberIds: ["user1"],
      name: "General",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty memberIds", () => {
    const result = createChatSchema.safeParse({
      type: "PRIVATE",
      memberIds: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects > 100 members", () => {
    const result = createChatSchema.safeParse({
      type: "ROOM",
      memberIds: Array.from({ length: 101 }, (_, i) => `u${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("rejects name > 100 chars", () => {
    const result = createChatSchema.safeParse({
      type: "PRIVATE",
      memberIds: ["u1"],
      name: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = createChatSchema.safeParse({
      type: "INVALID",
      memberIds: ["u1"],
    });
    expect(result.success).toBe(false);
  });
});

describe("sendMessageSchema", () => {
  it("accepts text content", () => {
    const result = sendMessageSchema.safeParse({ content: "Hello!" });
    expect(result.success).toBe(true);
  });

  it("accepts image URL", () => {
    const result = sendMessageSchema.safeParse({
      imageUrl: "https://example.com/img.png",
    });
    expect(result.success).toBe(true);
  });

  it("accepts both content and image", () => {
    const result = sendMessageSchema.safeParse({
      content: "Check this out",
      imageUrl: "https://example.com/img.png",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty message (no content, no image)", () => {
    const result = sendMessageSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects content > 5000 chars", () => {
    const result = sendMessageSchema.safeParse({ content: "a".repeat(5001) });
    expect(result.success).toBe(false);
  });

  it("rejects invalid image URL", () => {
    const result = sendMessageSchema.safeParse({ imageUrl: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("accepts valid URL formats", () => {
    expect(
      sendMessageSchema.safeParse({ imageUrl: "https://example.com" }).success,
    ).toBe(true);
    expect(
      sendMessageSchema.safeParse({ imageUrl: "http://localhost:3000/img.png" })
        .success,
    ).toBe(true);
  });
});

describe("findOrRestoreChatSchema", () => {
  it("accepts valid otherUserId", () => {
    expect(
      findOrRestoreChatSchema.safeParse({ otherUserId: "abc" }).success,
    ).toBe(true);
  });

  it("rejects empty otherUserId", () => {
    expect(findOrRestoreChatSchema.safeParse({ otherUserId: "" }).success).toBe(
      false,
    );
  });
});

describe("chatParamsSchema", () => {
  it("accepts valid chatId", () => {
    expect(chatParamsSchema.safeParse({ chatId: "abc" }).success).toBe(true);
  });

  it("rejects empty chatId", () => {
    expect(chatParamsSchema.safeParse({ chatId: "" }).success).toBe(false);
  });
});
