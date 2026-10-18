"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { supabase } from "@/lib/db/supabase";
import { profileImageSchema } from "@/lib/validation/profile";
import { headers } from "next/headers";

const BUCKET = "avatar";
const PUBLIC_PREFIX = `/storage/v1/object/public/${BUCKET}/`;

const removeStoredBanner = async (bannerUrl: string | null | undefined) => {
  if (!bannerUrl?.includes(`${PUBLIC_PREFIX}banner-image/`)) return;
  try {
    const path = decodeURIComponent(
      new URL(bannerUrl).pathname.replace(PUBLIC_PREFIX, ""),
    );
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) {
      console.error(
        "[bannerImage] Failed to remove old banner:",
        error.message,
      );
    }
  } catch (err) {
    console.error("[bannerImage] Error parsing old banner URL:", err);
  }
};

export const uploadBannerImageAction = async (file: File) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };
  if (!file) return { error: "File is required" };

  const result = await profileImageSchema.safeParseAsync(file);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid file" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { bannerImage: true },
  });

  const cleanFileName = file.name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_.]/g, "");
  const filePath = `banner-image/${session.user.id}-${Date.now()}-${cleanFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, { upsert: true, cacheControl: "3600" });

  if (uploadError) {
    console.error(
      "[uploadBannerImageAction] Upload error:",
      uploadError.message,
    );
    return { error: "Failed to upload banner" };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { bannerImage: data.publicUrl },
  });
  await removeStoredBanner(user?.bannerImage);

  return { url: data.publicUrl };
};

export const removeBannerImageAction = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { bannerImage: true },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { bannerImage: null },
    });
    await removeStoredBanner(user?.bannerImage);

    return { success: true };
  } catch (err) {
    console.error("[removeBannerImageAction] Error:", err);
    return { error: "Failed to remove banner" };
  }
};
