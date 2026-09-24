import { z } from "zod";

// ── Room CRUD ────────────────────────────────────────────────────
export const roomTypeSchema = z.enum(["PUBLIC", "PRIVATE", "FRIENDS"]);
export const roomRoleSchema = z.enum(["HOST", "MEMBER"]);

export const roomThumbnailUrlSchema = z.union([
  z.url({ protocol: /^https?$/ }).max(2000),
  z.string().regex(/^\/room-covers\/[a-z0-9-]+\.webp$/),
]);

export const createRoomSchema = z.object({
  name: z
    .string()
    .min(1, "Room name is required")
    .max(100, "Room name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  thumbnailUrl: roomThumbnailUrlSchema.optional(),
  type: roomTypeSchema,
  memberIds: z
    .array(z.string())
    .max(29, "Cannot invite more than 29 members")
    .optional(),
  maxMembers: z
    .number()
    .int()
    .min(2, "Room must allow at least 2 members")
    .max(30, "Room cannot have more than 30 members")
    .optional(),
});

export const updateRoomSchema = z.object({
  name: z
    .string()
    .min(1, "Room name is required")
    .max(100, "Room name must be less than 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable(),
  thumbnailUrl: roomThumbnailUrlSchema.optional().nullable(),
  type: roomTypeSchema.optional(),
  memberIds: z.array(z.string()).optional(),
  maxMembers: z.number().int().min(2).max(30).optional().nullable(),
});

export const roomVideoSourceSchema = z.enum(["YOUTUBE", "UPLOAD"]);

export const updateCurrentVideoSchema = z.object({
  currentVideoId: z.string().min(1, "currentVideoId is required"),
  title: z.string().max(200).optional(),
  videoSource: roomVideoSourceSchema.optional(),
});

export const updatePreviousVideoSchema = z.object({
  previousVideoId: z.string().min(1, "previousVideoId is required"),
  currentVideoId: z.string().optional(),
});

// ── Room Params ──────────────────────────────────────────────────
export const roomParamsSchema = z.object({
  id: z.string().min(1, "Room ID is required"),
});

// ── Types ────────────────────────────────────────────────────────
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type UpdateCurrentVideoInput = z.infer<typeof updateCurrentVideoSchema>;
