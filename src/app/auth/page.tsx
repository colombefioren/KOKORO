"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScreenWidth } from "@/hooks/useScreenWidth";
import { Button } from "@/components/ui/button";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { cn } from "@/lib/utils";

const getScreenConfig = (width: number) => {
  if (width < 500) return { leftPos: -50, division: 2.3, isMobile: true };
  if (width < 700) return { leftPos: -100, division: 2.3, isMobile: true };
  if (width < 1200) return { leftPos: -115, division: 1.9, isMobile: false };
  if (width < 1300) return { leftPos: -110, division: 2.3, isMobile: false };
  return { leftPos: -90, division: 2.3, isMobile: false };
};

const AuthPage = () => {
  const [toggled, setToggled] = useState(false);
  const screenWidth = useScreenWidth();
  const { leftPos, division, isMobile } = getScreenConfig(screenWidth);

  const formVariantsDesktop = {
    enterLeft: { x: -400 },
    enterRight: { x: 400 },
    center: { x: 0 },
    exitLeft: { x: -400 },
    exitRight: { x: 400 },
  };

  const formVariantsMobile = {
    enterTop: { y: -600 },
    enterBottom: { y: 600 },
    center: { y: 0 },
    exitTop: { y: -600 },
    exitBottom: { y: 600 },
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      <motion.div
        className="absolute rounded-full w-[160vw] z-2 aspect-square bg-light-royal-blue"
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

      <div className="relative w-full h-[70vh] flex justify-center items-center z-1">
        <AnimatePresence mode="wait">
          {toggled && (
            <motion.div
              key="login"
              initial={isMobile ? "enterBottom" : "enterRight"}
              animate="center"
              exit={isMobile ? "exitBottom" : "exitRight"}
              variants={isMobile ? formVariantsMobile : formVariantsDesktop}
              transition={{ duration: 0.6 }}
              className={cn(
                "absolute top-0",
                isMobile
                  ? "w-full max-w-[90%] mx-auto flex justify-center"
                  : "left-15 w-[400px] h-full flex items-center"
              )}
            >
              <LoginForm />
            </motion.div>
          )}
          {!toggled && (
            <motion.div
              key="register"
              initial={isMobile ? "enterTop" : "enterLeft"}
              animate="center"
              exit={isMobile ? "exitTop" : "exitLeft"}
              variants={isMobile ? formVariantsMobile : formVariantsDesktop}
              transition={{ duration: 0.6 }}
              className={cn(
                "absolute top-0",
                isMobile
                  ? "w-full max-w-[90%] mx-auto flex justify-center"
                  : "right-15 w-[400px] h-full flex items-center"
              )}
            >
              <RegisterForm />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button
        onClick={() => setToggled((prev) => !prev)}
        className="absolute top-0 z-3 px-6 py-3 rounded-lg bg-red-700 text-white font-medium hover:bg-red-900 transition-colors shadow-lg"
      >
        Toggle
      </Button>
    </div>
  );
};

export default AuthPage;
