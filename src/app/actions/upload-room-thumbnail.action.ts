"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { supabase } from "@/lib/db/supabase";
import { profileImageSchema } from "@/lib/validation/profile";
import { headers } from "next/headers";

export const uploadRoomThumbnailAction = async (
  file: File,
  roomId?: string,
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" };
  }

  if (!file) {
    return { error: "File is required" };
  }

  const result = await profileImageSchema.safeParseAsync(file);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid file" };
  }

  if (roomId) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: {
        thumbnailUrl: true,
        members: { where: { userId: session.user.id, role: "HOST" } },
      },
    });

    if (!room || room.members.length === 0) {
      return { error: "Only the host can change the room thumbnail" };
    }

    if (
      room.thumbnailUrl?.includes("/storage/v1/object/public/room-thumbnail/")
    ) {
      try {
        const url = new URL(room.thumbnailUrl);
        const path = decodeURIComponent(
          url.pathname.replace(`/storage/v1/object/public/room-thumbnail/`, ""),
        );
        const { error: removeError } = await supabase.storage
          .from("room-thumbnail")
          .remove([path]);
        if (removeError) {
          console.error(
            "[uploadRoomThumbnailAction] Failed to remove old thumbnail:",
            removeError.message,
          );
        }
      } catch (err) {
        console.error(
          "[uploadRoomThumbnailAction] Error parsing old thumbnail URL:",
          err,
        );
      }
    }
  }

  const cleanFileName = file.name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_.]/g, "");

  const filePath = `room-thumbnail/${session.user.id}-${Date.now()}-${cleanFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("room-thumbnail")
    .upload(filePath, file, {
      upsert: true,
      cacheControl: "3600",
    });

  if (uploadError) {
    console.error(
      "[uploadRoomThumbnailAction] Supabase upload error:",
      uploadError.message,
    );
    return { error: `Failed to upload thumbnail: ${uploadError.message}` };
  }

  const { data } = supabase.storage
    .from("room-thumbnail")
    .getPublicUrl(filePath);

  return { url: data.publicUrl };
};
