"use client";

import { useEffect, useState } from "react";
import ProfileHeader from "./profile-header";
import ProfileTabs from "./profile-tabs";
import FriendsTab from "./tabs/friends-tab";
import RoomsTab from "./tabs/rooms-tab";
import { User } from "@/types/user";
import { getUserById } from "@/services/user.service";
import { useUserStore } from "@/store/useUserStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfilePanelProps {
  userId: string;
}

const ProfilePanel = ({ userId }: ProfilePanelProps) => {
  const [activeTab, setActiveTab] = useState("friends");
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const currentUser = useUserStore((state) => state.user);
  const router = useRouter();
  const isCurrentUser = currentUser?.id === userId;

  useEffect(() => {
    try {
      setIsLoadingUser(true);
      const fetchUser = async () => {
        const user = await getUserById(userId);
        setUser(user);
        setIsLoadingUser(false);
      };
      fetchUser();
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  if (isLoadingUser || !user) {
    return (
      <div className="flex flex-col w-full items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-light-royal-blue animate-spin mb-2" />
        <p className="text-light-bluish-gray">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="py-8 mx-10">
      {!isCurrentUser && (
        <Button
          onClick={() => router.push("/profile")}
          className="bg-white/5 text-white border-light-royal-blue/30 hover:bg-white/10 hover:border-light-royal-blue/50 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go back to your profile
        </Button>
      )}
      <ProfileHeader user={user} isCurrentUser={isCurrentUser} />
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-16">
        {activeTab === "friends" && <FriendsTab userId={userId} />}
        {activeTab === "rooms" && <RoomsTab userId={userId} />}
      </div>
    </div>
  );
};

export default ProfilePanel;
