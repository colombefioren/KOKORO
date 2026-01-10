"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import SettingsHeader from "./settings-header";
import SettingsNavigation from "./settings-navigation";
import AvatarSection from "./avatar-section";
import SettingsContent from "./settings-content";
import { Loader } from "lucide-react";

const UpdateProfilePanel = () => {
  const { user, isLoadingUser } = useUserStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isLoadingUser || !user)
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 text-light-royal-blue animate-spin mx-auto" />
          <div className="text-white text-lg font-medium">
            Loading settings...
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex-1 py-4 sm:py-6 relative">
      <SettingsHeader />

      <div className="settings-container flex flex-col lg:flex-row gap-8 lg:gap-12 mt-6 lg:mt-8 relative z-10">
        <div className="w-full lg:w-64 flex-shrink-0">
          <SettingsNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {activeTab === "profile" && isMobile && (
            <div className="mt-8 lg:mt-0">
              <AvatarSection user={user} />
            </div>
          )}

           <div className="hidden lg:block mt-6">
              <AvatarSection user={user} />
            </div>
        </div>

        <div className="group relative flex-1">
          <div className="absolute -inset-2 bg-gradient-to-br from-light-royal-blue/10 to-plum/5 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative bg-gradient-to-br from-darkblue/80 to-bluish-gray/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-light-royal-blue/30 shadow-2xl transition-all duration-500">
            <SettingsContent activeTab={activeTab} user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfilePanel;
