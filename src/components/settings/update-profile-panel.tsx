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
    <div className="flex-1 py-4 sm:py-6">
      <SettingsHeader />

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mt-4">
        <div className="w-full lg:w-56 flex-shrink-0">
          <SettingsNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {activeTab === "profile" && isMobile && (
            <div className="mt-6 lg:mt-0">
              <AvatarSection user={user} />
            </div>
          )}

          <div className="hidden lg:block mt-5">
            <AvatarSection user={user} />
          </div>
        </div>

        <div className="flex-1 min-w-0 bg-darkblue rounded-2xl p-4 sm:p-6 border border-white/8">
          <SettingsContent activeTab={activeTab} user={user} />
        </div>
      </div>
    </div>
  );
};

export default UpdateProfilePanel;
