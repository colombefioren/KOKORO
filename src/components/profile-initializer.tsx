"use client";

import { isOauthUser } from "@/app/actions/is-oauth-user.action";
import { useSession } from "@/lib/auth/auth-client";
import { getUser } from "@/services/user.service";
import { useUserStore } from "@/store/useUserStore";
import { useEffect, useRef } from "react";

const ProfileInitializer = () => {
  const { data: session, isPending } = useSession();
  const setUser = useUserStore((state) => state.setUser);
  const setIsLoadingUser = useUserStore((state) => state.setLoadingUser);
  const abortRef = useRef<AbortController | null>(null);
  const initIdRef = useRef(0);

  useEffect(() => {
    setIsLoadingUser(isPending);
  }, [isPending, setIsLoadingUser]);

  useEffect(() => {
    if (!session?.user) {
      setUser(null);
      return;
    }

    // Cancel any in-flight previous fetch
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const currentInitId = ++initIdRef.current;

    const init = async () => {
      try {
        const [oauth, fullUser] = await Promise.all([
          isOauthUser(session.user.id),
          getUser(),
        ]);

        // Guard: if a newer init started, discard this result
        if (controller.signal.aborted || currentInitId !== initIdRef.current) {
          return;
        }

        setUser({
          id: session.user.id,
          name: session.user.name,
          firstName: session.user.name.split(" ")[0] || "",
          lastName: session.user.name.split(" ")[1] || "",
          email: session.user.email,
          image: session.user.image,
          emailVerified: session.user.emailVerified,
          username: session.user.username,
          displayUsername: session.user.displayUsername,
          isOauthUser: oauth,
          bio: fullUser.bio || "",
          createdAt: fullUser.createdAt ?? Date.now().toString(),
        });
      } catch (err) {
        if (!controller.signal.aborted && currentInitId === initIdRef.current) {
          console.error("Failed to initialize profile", err);
        }
      }
    };

    init();

    return () => {
      controller.abort();
    };
  }, [session?.user, setUser]);

  return null;
};

export default ProfileInitializer;
