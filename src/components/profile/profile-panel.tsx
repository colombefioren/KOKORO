"use client";

import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import ProfileHeader from "./profile-header";
import ProfileTabs from "./profile-tabs";
import FriendsTab from "./tabs/friends-tab";
import RoomsTab from "./tabs/rooms-tab";

const ProfilePanel = () => {
  const { user, isLoadingUser } = useUserStore();
  const [activeTab, setActiveTab] = useState("friends");

  if (isLoadingUser || !user) {
    return (
      <div className="text-light-blue flex justify-center items-center min-h-64">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <ProfileHeader user={user} />
        
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="mt-12">
          {activeTab === "friends" && <FriendsTab />}
          {activeTab === "rooms" && <RoomsTab />}
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;