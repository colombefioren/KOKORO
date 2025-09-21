"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScreenWidth } from "@/hooks/useScreenWidth";
import { cn } from "@/lib/utils";
import RegisterForm from "./register-form";
import LoginForm from "./login-form";

const getScreenConfig = (width: number) => {
  if (width < 500) return { leftPos: -50, isMobile: true };
  if (width < 700) return { leftPos: -80, isMobile: true };
  if (width < 900) return { leftPos: -125, isMobile: false };
  if (width < 1200) return { leftPos: -110, isMobile: false };
  return { leftPos: -95, isMobile: false };
};

const AuthPanel = () => {
  const [mounted, setMounted] = useState(false);
  const [toggled, setToggled] = useState(false);
  const screenWidth = useScreenWidth();
  const { leftPos, isMobile } = getScreenConfig(screenWidth);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const formVariantsDesktop = {
    enterLeft: { x: -400, opacity: 0 },
    enterRight: { x: 400, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exitLeft: { x: -400, opacity: 0 },
    exitRight: { x: 400, opacity: 0 },
  };

  const formVariantsMobile = {
    enterTop: { y: -600, opacity: 0 },
    enterBottom: { y: 600, opacity: 0 },
    center: { y: 0, opacity: 1 },
    exitTop: { y: -600, opacity: 0 },
    exitBottom: { y: 600, opacity: 0 },
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      <motion.div
        className="absolute rounded-full w-[160vw] aspect-square z-2 bg-light-royal-blue"
        animate={{
          right: !toggled ? `${leftPos}vw` : ``,
          left: !toggled ? `` : `${leftPos}vw`,
          top: isMobile ? (!toggled ? "" : "-96vh") : "-45vh",
          bottom: isMobile ? (!toggled ? "-96vh" : "") : "",
        }}
        transition={{
          duration: 1.2,
          ease: "easeInOut",
        }}
      />

      <div className="relative w-full h-[70vh] flex justify-center items-center z-1">
        <AnimatePresence mode="wait" initial={false}>
          {!toggled && (
            <motion.div
              key="login"
              initial={
                mounted ? (isMobile ? "enterBottom" : "enterRight") : undefined
              }
              animate="center"
              exit={isMobile ? "exitBottom" : "exitRight"}
              variants={isMobile ? formVariantsMobile : formVariantsDesktop}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className={cn(
                isMobile
                  ? "w-full max-w-[90%] mx-auto flex justify-center"
                  : "absolute left-15 top-1/2 -translate-y-1/2 w-[400px]"
              )}
            >
              <LoginForm onToggle={() => setToggled(true)} />
            </motion.div>
          )}
          {toggled && (
            <motion.div
              key="register"
              initial={
                mounted ? (isMobile ? "enterTop" : "enterLeft") : undefined
              }
              animate="center"
              exit={isMobile ? "exitTop" : "exitLeft"}
              variants={isMobile ? formVariantsMobile : formVariantsDesktop}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className={cn(
                isMobile
                  ? "w-full max-w-[90%] mx-auto flex justify-center"
                  : "absolute right-15 top-1/2 -translate-y-1/2 w-[400px] h-full flex items-center"
              )}
            >
              <RegisterForm onToggle={() => setToggled(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthPanel;
