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
    <div className="relative flex gap-1 border-b border-light-royal-blue/10 pb-2">
      <div
        className="absolute bottom-0 h-1 rounded-t-full bg-gradient-to-r from-light-royal-blue to-plum transition-all duration-500 ease-out shadow-lg shadow-light-royal-blue/30"
        style={{
          left: `${sliderStyle.left}px`,
          width: `${sliderStyle.width}px`,
          opacity: sliderStyle.opacity,
        }}
      />

      <div
        className="absolute -bottom-1 h-2 rounded-t-full bg-gradient-to-r from-light-royal-blue/40 to-plum/40 blur-sm transition-all duration-500 ease-out"
        style={{
          left: `${sliderStyle.left - 4}px`,
          width: `${sliderStyle.width + 8}px`,
          opacity: sliderStyle.opacity * 0.7,
        }}
      />

      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={(el) => {
            tabsRef.current[index] = el;
          }}
          className={`relative cursor-pointer text-sm rounded-xl px-8 py-3 transition-all duration-300 font-semibold backdrop-blur-sm ${
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
