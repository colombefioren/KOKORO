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
import { ArrowLeft, Loader, UserX, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

  

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="p-4 bg-gradient-to-br from-light-royal-blue/20 to-plum/20 rounded-3xl border border-light-royal-blue/30">
              <Image
                src="/logo.png"
                alt="Kokoro"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-white">Kokoro</h1>
              <p className="text-light-bluish-gray text-md flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink" />
                Heart To Heart
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-darkblue/50 to-bluish-gray/30 rounded-3xl p-12 border border-light-royal-blue/20 shadow-2xl backdrop-blur-sm mb-8">
            <div className="mb-8">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-light-royal-blue to-plum bg-clip-text font-fredoka mb-4">
                User Not Found
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-light-royal-blue to-plum rounded-full mx-auto mb-6"></div>
              <p className="text-light-bluish-gray text-md max-w-md mx-auto">
                The profile you&apos;re looking for doesn&apos;t exist or may have been
                removed. Let&apos;s find other amazing people to connect with.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => router.back()}
              className="bg-white/10 text-white border-light-royal-blue/30 hover:bg-white/20 hover:border-light-royal-blue/50 rounded-2xl px-8 py-4 text-md font-semibold transition-all duration-300 hover:scale-105 group"
            >
              <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
              Go Back
            </Button>
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-light-royal-blue to-plum text-white rounded-2xl px-8 py-4 text-md font-semibold hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-lg group"
            >
              Discover People
            </Button>
          </div>

          <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-light-royal-blue/20">
            <p className="text-light-bluish-gray text-sm flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-pink" />
              Every heart has a story - explore new connections today
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
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
