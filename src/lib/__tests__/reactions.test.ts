import { describe, it, expect } from "vitest";
import { onePerUser, setUserReaction } from "../reactions";

const alice = { id: "a", name: "Alice", image: null };
const bob = { id: "b", name: "Bob", image: null };

const reaction = (user: typeof alice, emoji: string) => ({
  id: `${user.id}-${emoji}`,
  emoji,
  userId: user.id,
  user,
});

describe("setUserReaction", () => {
  it("replaces the user's previous reaction instead of stacking", () => {
    const result = setUserReaction(
      [reaction(alice, "👍"), reaction(bob, "🔥")],
      "m1",
      alice,
      "❤️",
    );

    expect(result.filter((r) => r.userId === "a")).toHaveLength(1);
    expect(result.find((r) => r.userId === "a")?.emoji).toBe("❤️");
    expect(result.find((r) => r.userId === "b")?.emoji).toBe("🔥");
  });

  it("clears every reaction of the user when emoji is null", () => {
    const result = setUserReaction(
      [reaction(alice, "👍"), reaction(alice, "😂"), reaction(bob, "🔥")],
      "m1",
      alice,
      null,
    );

    expect(result).toEqual([reaction(bob, "🔥")]);
  });
});

describe("onePerUser", () => {
  it("keeps only the latest reaction of each user", () => {
    const result = onePerUser([
      reaction(alice, "👍"),
      reaction(bob, "🔥"),
      reaction(alice, "🎉"),
    ]);

    expect(result.map((r) => [r.userId, r.emoji])).toEqual([
      ["a", "🎉"],
      ["b", "🔥"],
    ]);
  });
});
