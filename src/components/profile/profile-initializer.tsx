"use client";

import { isOauthUser } from "@/app/actions/is-oauth-user.action";
import { useUserStore } from "@/store/useUserStore";
import { useSession } from "@/lib/auth/auth-client";
import { useEffect } from "react";

const ProfileInitializer = () => {
  const { data: session, isPending } = useSession();
  const setUser = useUserStore((state) => state.setUser);
  const setIsLoadingUser = useUserStore((state) => state.setLoadingUser);

  useEffect(() => {
    setIsLoadingUser(isPending);

    if (!session?.user) return;

    const init = async () => {
      try {
        const oauth = await isOauthUser(session.user.id);

        setUser({
          id: session.user.id,
          firstName: session.user.name.split(" ")[0] || "",
          lastName: session.user.name.split(" ")[1] || "",
          email: session.user.email,
          image: session.user.image,
          emailVerified: session.user.emailVerified,
          username: session.user.username,
          displayUsername: session.user.displayUsername,
          isOauthUser: oauth,
          bio: "",
        });
      } catch (err) {
        console.error("Failed to check oauth user", err);
      }
    };

    init();
  }, [session?.user, isPending, setUser, setIsLoadingUser]);

  return null;
};

export default ProfileInitializer;
