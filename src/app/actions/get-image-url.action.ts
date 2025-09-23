"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { supabase } from "@/lib/db/supabase";
import { profileImageSchema } from "@/lib/validation/profile";
import { headers } from "next/headers";

export const getImageUrlAction = async (file: File) => {
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
    return { error: "Invalid file" };
  }

  const user = await prisma?.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.image) {
    const url = new URL(user.image);
    const path = decodeURIComponent(
      url.pathname.replace(`/storage/v1/object/public/avatar/`, "")
    );
    await supabase.storage.from("avatar").remove([path]);
  }

  const cleanFileName = file.name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_.]/g, "");

  const filePath = `profile-image/${
    session.user.id
  }-${Date.now()}-${cleanFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("avatar")
    .upload(filePath, file, {
      upsert: true,
      cacheControl: "3600",
    });

  if (uploadError) {
    console.error(uploadError.message);
    return { error: "Failed to upload image" };
  }

  const { data } = supabase.storage.from("avatar").getPublicUrl(filePath);

  return { url: data.publicUrl };
};
