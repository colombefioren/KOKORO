import { z } from "zod";

// ── Friend Request ───────────────────────────────────────────────
export const sendFriendRequestSchema = z.object({
  receiverId: z.string().min(1, "Receiver ID is required"),
});

export const acceptFriendRequestSchema = z.object({
  requesterId: z.string().min(1, "Requester ID is required"),
});

export const declineFriendRequestSchema = z.object({
  friendId: z.string().min(1, "Friend ID is required"),
});

// ── Params ───────────────────────────────────────────────────────
export const friendParamsSchema = z.object({
  id: z.string().min(1, "Friend ID is required"),
});

// ── Types ────────────────────────────────────────────────────────
export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;
export type AcceptFriendRequestInput = z.infer<typeof acceptFriendRequestSchema>;
