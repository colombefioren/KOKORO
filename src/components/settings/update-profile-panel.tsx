"use client";
import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import SettingsHeader from "./settings-header";
import SettingsNavigation from "./settings-navigation";
import AvatarSection from "./avatar-section";
import SettingsContent from "./settings-content";
import { Loader } from "lucide-react";

const UpdateProfilePanel = () => {
  const { user, isLoadingUser } = useUserStore();
  const [activeTab, setActiveTab] = useState("profile");

  if (isLoadingUser || !user)
    return (
      <div className="flex flex-col items-center justify-center min-h-64">
        <Loader className="w-8 h-8 text-light-royal-blue animate-spin mb-2" />
        <p className="text-light-bluish-gray">Loading profile...</p>
      </div>
    );

  return (
    <div className="flex-1 py-6 relative">
      <SettingsHeader />

      <div className="settings-container flex flex-col lg:flex-row gap-12 mt-8 relative z-10">
        <div className="w-full lg:w-64 flex-shrink-0">
          <SettingsNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <AvatarSection user={user} />
        </div>

        <div className="group relative flex-1">
          <div className="absolute -inset-2 bg-gradient-to-br from-light-royal-blue/10 to-plum/5 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative bg-gradient-to-br from-darkblue/80 to-bluish-gray/60 backdrop-blur-sm rounded-2xl p-8 border border-light-royal-blue/30 shadow-2xl transition-all duration-500">
            <SettingsContent activeTab={activeTab} user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfilePanel;
