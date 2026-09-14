import { z } from "zod";

// ── Chat CRUD ────────────────────────────────────────────────────
export const createChatSchema = z.object({
  type: z.enum(["PRIVATE", "ROOM"]),
  memberIds: z
    .array(z.string())
    .min(1, "At least one member is required")
    .max(100, "Too many members"),
  name: z
    .string()
    .max(100, "Chat name must be less than 100 characters")
    .optional(),
});

export const sendMessageSchema = z.object({
  content: z
    .string()
    .max(5000, "Message must be less than 5000 characters")
    .optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
}).refine(
  (data) => data.content || data.imageUrl,
  "Message must have content or an image"
);

export const findOrRestoreChatSchema = z.object({
  otherUserId: z.string().min(1, "Other user ID is required"),
});

// ── Params ───────────────────────────────────────────────────────
export const chatParamsSchema = z.object({
  chatId: z.string().min(1, "Chat ID is required"),
});

// ── Types ────────────────────────────────────────────────────────
export type CreateChatInput = z.infer<typeof createChatSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
