"use server";

import prisma from "@/lib/db/prisma";

export const isOauthUser = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        accounts: true,
      },
    });

    if (!user) return false;
    return !user.accounts.some((acc) => acc.providerId === "credential");
  } catch (err) {
    console.error(err);
    return false;
  }
};
