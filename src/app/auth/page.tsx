"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useScreenWidth } from "@/hooks/useScreenWidth";
import { Button } from "@/components/ui/button";

const getScreenConfig = (width: number) => {
  if (width < 500) return { leftPos: -50, division: 2.3, isMobile: true };
  if (width < 700) return { leftPos: -100, division: 2.3, isMobile: true };
  if (width < 1200) return { leftPos: -115, division: 1.9, isMobile: false };
  return { leftPos: -90, division: 2.3, isMobile: false };
};

const AuthPage = () => {
  const [toggled, setToggled] = useState(false);
  const screenWidth = useScreenWidth();
  const { leftPos, division, isMobile } = getScreenConfig(screenWidth);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <motion.div
        className="absolute rounded-full w-[160vw] aspect-square bg-light-royal-blue"
        animate={{
          left: toggled ? `${(leftPos * -1) / division}vw` : `${leftPos}vw`,
          top: isMobile ? (toggled ? "75vh" : "-90vh") : "-45vh",
          scale: toggled ? 1.1 : 1,
        }}
        transition={{
          duration: 2,
          ease: [0.6, 0.01, -0.05, 0.95],
        }}
      />

      <Button
        onClick={() => setToggled((prev) => !prev)}
        className="relative z-10 px-6 py-3 rounded-lg bg-red-700 text-white font-medium hover:bg-red-900 transition-colors shadow-lg"
      >
        Toggle
      </Button>
    </div>
  );
};

export default AuthPage;
