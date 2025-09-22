"use client";

import { useUserStore } from "@/app/store/useUserStore";
import { useSession } from "@/lib/auth/auth-client";
import { useEffect } from "react";

const ProfileInitializer = () => {
  const { data: session, isPending } = useSession();
  const setUser = useUserStore((state) => state.setUser);
  const setIsLoadingUser = useUserStore((state) => state.setLoadingUser);

  useEffect(() => {
    setIsLoadingUser(isPending);

    if (!session?.user) return;

    setUser({
      id: session.user.id,
      firstName: session.user.name.split(" ")[0],
      lastName: session.user.name.split(" ")[1],
      email: session.user.email,
      image: session.user.image,
      emailVerified: session.user.emailVerified,
      username: session.user.username,
      displayUsername: session.user.displayUsername,
    });
  }, [session?.user, isPending, setUser, setIsLoadingUser]);

  return null;
};

export default ProfileInitializer;
