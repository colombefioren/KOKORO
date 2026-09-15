"use server";

import { auth } from "@/lib/auth/auth";
import { canControlRoom } from "@/lib/rooms/can-control";
import { supabase } from "@/lib/db/supabase";
import { roomVideoFileSchema } from "@/lib/validation/profile";
import { headers } from "next/headers";

export const uploadRoomVideoAction = async (file: File, roomId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Unauthorized" };
  }

  if (!file || !roomId) {
    return { error: "File and roomId are required" };
  }

  const result = await roomVideoFileSchema.safeParseAsync(file);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid file" };
  }

  const canControl = await canControlRoom(roomId, session.user.id);
  if (!canControl) {
    return { error: "You are not authorized to control this room" };
  }

  const cleanFileName = file.name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_.]/g, "");

  const filePath = `room-video/${roomId}-${Date.now()}-${cleanFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("room-video")
    .upload(filePath, file, {
      upsert: true,
      cacheControl: "3600",
    });

  if (uploadError) {
    return { error: "Failed to upload video" };
  }

  const { data } = supabase.storage.from("room-video").getPublicUrl(filePath);

  return { url: data.publicUrl };
};
