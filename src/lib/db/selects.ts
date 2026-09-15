import { Prisma } from "@prisma/client";

export const publicUserSelect = {
  id: true,
  name: true,
  image: true,
  username: true,
  displayUsername: true,
  bio: true,
  isOnline: true,
  lastSeenAt: true,
  createdAt: true,
} satisfies Prisma.UserSelect;
