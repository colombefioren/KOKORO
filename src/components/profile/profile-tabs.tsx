"use client";

import { useRef, useEffect, useState } from "react";

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ProfileTabs = ({ activeTab, onTabChange }: ProfileTabsProps) => {
  const tabs = [
    { id: "friends", label: "Friends" },
    { id: "rooms", label: "Rooms" },
  ];

  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [sliderStyle, setSliderStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  useEffect(() => {
    if (tabsRef.current[activeIndex]) {
      const activeTabElement = tabsRef.current[activeIndex];
      if (activeTabElement) {
        setSliderStyle({
          left: activeTabElement.offsetLeft,
          width: activeTabElement.offsetWidth,
          opacity: 1,
        });
      }
    }
  }, [activeIndex]);

  return (
    <div className="relative mt-8 flex gap-1 border-b border-white/10">
      <div
        className="absolute bottom-0 h-0.5 rounded-full bg-light-royal-blue transition-all duration-300 ease-out"
        style={{
          left: `${sliderStyle.left}px`,
          width: `${sliderStyle.width}px`,
          opacity: sliderStyle.opacity,
        }}
      />

      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={(el) => {
            tabsRef.current[index] = el;
          }}
          className={`relative cursor-pointer text-sm rounded-t-xl px-6 py-2.5 font-medium transition-colors ${
            activeTab === tab.id
              ? "text-white"
              : "text-light-bluish-gray hover:text-white"
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;
