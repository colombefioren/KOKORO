import { z } from "zod";

// ── Room CRUD ────────────────────────────────────────────────────
export const roomTypeSchema = z.enum(["PUBLIC", "PRIVATE", "FRIENDS"]);
export const roomRoleSchema = z.enum(["HOST", "MEMBER"]);

export const createRoomSchema = z.object({
  name: z
    .string()
    .min(1, "Room name is required")
    .max(100, "Room name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  thumbnailUrl: z.string().url().max(2000).optional(),
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
  thumbnailUrl: z.string().url().max(2000).optional().nullable(),
  type: roomTypeSchema.optional(),
  memberIds: z.array(z.string()).optional(),
  maxMembers: z.number().int().min(2).max(30).optional().nullable(),
});

export const updateCurrentVideoSchema = z.object({
  currentVideoId: z.string().min(1, "currentVideoId is required"),
  title: z.string().max(200).optional(),
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
