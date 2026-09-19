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
import { ArrowLeft, Loader, UserX } from "lucide-react";
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
      setUser(null);
      setIsLoadingUser(false);
    }
  }, [userId]);

  if (isLoadingUser) {
    return (
      <div className="fixed overflow-x-hidden inset-0 flex items-center justify-center z-50">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 text-light-royal-blue animate-spin mx-auto" />
          <div className="text-white text-lg font-medium">
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
            <UserX className="w-6 h-6 text-light-bluish-gray" />
          </div>

          <h1 className="text-xl font-semibold text-white mb-2">
            User not found
          </h1>
          <p className="text-light-bluish-gray text-sm mb-8">
            This profile doesn&apos;t exist or may have been removed.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.back()}
              className="bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-xl px-5 py-2.5 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={() => router.push("/")}
              className="bg-light-royal-blue hover:bg-light-royal-blue/90 text-white rounded-xl px-5 py-2.5 text-sm font-medium"
            >
              Discover People
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-8 mx-2 sm:mx-4 lg:mx-10">
      {!isCurrentUser && (
        <Button
          onClick={() => router.push("/profile")}
          className="bg-white/5 text-white border-light-royal-blue/30 hover:bg-white/10 hover:border-light-royal-blue/50 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 mb-6 w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go back to your profile
        </Button>
      )}
      <ProfileHeader user={user} isCurrentUser={isCurrentUser} />
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-8 sm:mt-16">
        <div className="container mx-auto px-2 sm:px-4 lg:px-6">
          {activeTab === "friends" && <FriendsTab userId={userId} />}
          {activeTab === "rooms" && <RoomsTab userId={userId} />}
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
