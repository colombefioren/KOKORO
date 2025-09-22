import { supabase } from "@/lib/db/supabase";
import { profileImageSchema } from "@/lib/validation/profile";

export const getImageUrl = async (file: File) => {
  if (!file) {
    return { error: "File is required" };
  }

  const result = await profileImageSchema.safeParseAsync(file);

  if (!result.success) {
    return { error: "Invalid file" };
  }

  const filePath = `profile-image/${file.name}-${Date.now()}`;

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
