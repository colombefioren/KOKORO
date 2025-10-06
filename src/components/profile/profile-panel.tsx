"use client";

import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import ProfileHeader from "./profile-header";
import ProfileTabs from "./profile-tabs";
import FriendsTab from "./tabs/friends-tab";
import RoomsTab from "./tabs/rooms-tab";
import FriendsSidebar from "./friends-sidebar";

const ProfilePanel = () => {
  const { user, isLoadingUser } = useUserStore();
  const [activeTab, setActiveTab] = useState("friends");

  if (isLoadingUser || !user) {
    return (
      <div className="text-light-blue flex justify-center items-center min-h-[16rem]">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center py-8">
      <div className=" w-full flex gap-8">
        <div className="flex-1">
          <ProfileHeader user={user} />
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="mt-12">
            {activeTab === "friends" && <FriendsTab />}
            {activeTab === "rooms" && <RoomsTab />}
          </div>
        </div>

        <div className="w-80">

        </div>

        <div className="w-80 fixed right-[72px] top-0 self-start">
          <FriendsSidebar />
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
