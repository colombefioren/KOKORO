import { User, Shield } from "lucide-react";

interface SettingsNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SettingsNavigation = ({
  activeTab,
  onTabChange,
}: SettingsNavigationProps) => {
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
  ];

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  return (
    <div className="relative mb-8">
      <div className="relative bg-darkblue/80 rounded-2xl p-2 border border-light-royal-blue/30 backdrop-blur-sm">
        <div
          className="absolute top-2 bottom-2 bg-gradient-to-r from-light-royal-blue/90 to-plum/80 rounded-xl shadow-lg transition-all duration-500 ease-out"
          style={{
            width: `calc(${100 / tabs.length}% - 8px)`,
            left: `calc(${activeIndex * (100 / tabs.length)}% + 4px)`,
          }}
        />

        <div className="relative flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex-1 cursor-pointer rounded-xl py-2 px-2 transition-all duration-300 font-medium group ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2 w-full justify-center">
                <tab.icon
                  className={`w-4 h-4 transition-transform duration-300 ${
                    activeTab === tab.id
                      ? "scale-110 drop-shadow-sm"
                      : "group-hover:scale-105"
                  }`}
                />
                <span className="text-sm font-semibold whitespace-nowrap">
                  {tab.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsNavigation;
