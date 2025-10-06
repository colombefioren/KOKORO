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

export const updateProfileInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name cannot be empty")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z]+$/, "First name can only contain letters")
    .optional(),

  lastName: z
    .string()
    .min(1, "Last name cannot be empty")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z]+$/, "Last name can only contain letters")
    .optional(),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

export const emailUpdateSchema = z.object({
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Invalid email address" }),
});

export const passwordUpdateSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "This field cannot be empty" }),
    newPassword: z
      .string()
      .min(8, { message: "Password should be at least 8 characters" }),
    confirmNewPassword: z
      .string()
      .min(1, { message: "This field cannot be empty" }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Passwords do not match",
  });

export type UpdateProfileInfoSchema = z.infer<typeof updateProfileInfoSchema>;

export type ProfileImage = z.infer<typeof profileImageSchema>;

export type EmailUpdateSchema = z.infer<typeof emailUpdateSchema>;

export type PasswordUpdateSchema = z.infer<typeof passwordUpdateSchema>;
