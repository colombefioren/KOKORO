"use server";

import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";
import { supabase } from "@/lib/db/supabase";
import { headers } from "next/headers";
export const removeImageUrlAction = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Unauthorized" };
    }

    const user = await prisma?.user.findUnique({
      where: { id: session.user.id },
    });

    if (
      user?.image?.startsWith(
        "https://avatar.iran.liara.run/username?username="
      )
    ) {
      return { success: "You have no profile picture to remove" };
    } else if (user?.image) {
      const url = new URL(user.image);
      const path = decodeURIComponent(
        url.pathname.replace(`/storage/v1/object/public/avatar/`, "")
      );
      await supabase.storage.from("avatar").remove([path]);
    }

    return { success: "Profile removed successfully" };
  } catch (err) {
    console.error("removeImageUrlAction failed:", err);
    return { error: "An error occurred while removing the profile picture" };
  }
};
