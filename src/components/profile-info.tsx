"use client";

import { useUserStore } from "@/store/useUserStore";
import SignOutButton from "./auth/sign-out-button";

const ProfileInfo = () => {
  const user = useUserStore((state) => state.user);
  const isLoadingUser = useUserStore((state) => state.isLoadingUser);

  if (isLoadingUser || !user) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-semibold text-xl">Profile</h1>
      <div className="flex space-y-4">
        <div className="flex flex-col gap-2">
          <span className="font-semibold">First name</span>
          <span>{user.firstName}</span>
          <span className="font-semibold">Last name</span>
          <span>{user.lastName}</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold">Email</span>
          <span>{user.email}</span>
        </div>
      </div>
      <SignOutButton />
    </div>
  );
};
export default ProfileInfo;
