import z from "zod";

export const profileImageSchema = z
  .instanceof(File)
  .refine(
    (file) => file.size <= 5 * 1024 * 1024,
    "File size must be less than 5MB"
  )
  .refine(
    (file) => file.type.startsWith("image/"),
    "Only image files are allowed"
  );

export type ProfileImage = z.infer<typeof profileImageSchema>;
