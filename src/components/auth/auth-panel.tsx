"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useScreenWidth } from "@/hooks/useScreenWidth";
import { cn } from "@/lib/utils";
import RegisterForm from "./register-form";
import LoginForm from "./login-form";
import Image from "next/image";

const getScreenConfig = (width: number) => {
  if (width < 500)
    return { leftPos: -50, isMobile: true, isSmallMobile: width < 400 };
  if (width < 700)
    return { leftPos: -80, isMobile: true, isSmallMobile: width < 400 };
  if (width < 900)
    return { leftPos: -125, isMobile: false, isSmallMobile: false };
  if (width < 1200)
    return { leftPos: -110, isMobile: false, isSmallMobile: false };
  return { leftPos: -95, isMobile: false, isSmallMobile: false };
};

const AuthPanel = () => {
  const [mounted, setMounted] = useState(false);
  const [toggled, setToggled] = useState(false);
  const [circleDone, setCircleDone] = useState(false);
  const screenWidth = useScreenWidth();
  const { leftPos, isMobile, isSmallMobile } = getScreenConfig(screenWidth);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setCircleDone(false);
    const timer = setTimeout(() => setCircleDone(true), 1200);
    return () => clearTimeout(timer);
  }, [toggled]);

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

  const rectangleVariants: Variants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: ["easeOut"],
      },
    },
    exit: {
      opacity: 0,
      scale: 1.1,
      transition: { duration: 0.5 },
    },
  };

  if (isSmallMobile) {
    return (
      <div className="relative bg-ebony min-h-screen overflow-hidden flex items-center justify-center">
        <motion.div
          className="absolute rounded-full w-[160vw] aspect-square z-2 bg-darkblue"
          animate={{
            right: toggled ? `${leftPos}vw` : ``,
            left: toggled ? `` : `${leftPos}vw`,
            top: "-96vh",
            bottom: "",
          }}
          transition={{
            duration: 1.2,
            ease: "easeInOut",
          }}
        />

        <div className="relative w-full h-[70vh] flex justify-center items-center">
          <AnimatePresence mode="wait" initial={false}>
            {!toggled && (
              <motion.div
                key="login"
                initial={mounted ? "enterBottom" : undefined}
                animate="center"
                exit="exitBottom"
                variants={formVariantsMobile}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="w-full max-w-[90%] mx-auto flex justify-center"
              >
                <LoginForm onToggle={() => setToggled(true)} />
              </motion.div>
            )}
            {toggled && (
              <motion.div
                key="register"
                initial={mounted ? "enterTop" : undefined}
                animate="center"
                exit="exitTop"
                variants={formVariantsMobile}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="w-full max-w-[90%] mx-auto flex justify-center"
              >
                <RegisterForm onToggle={() => setToggled(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-ebony min-h-screen overflow-hidden flex items-center justify-center">
      <motion.div
        className="absolute rounded-full w-[160vw] aspect-square z-2 bg-darkblue"
        animate={{
          right: toggled ? `${leftPos}vw` : ``,
          left: toggled ? `` : `${leftPos}vw`,
          top: isMobile ? (!toggled ? "" : "-96vh") : "-45vh",
          bottom: isMobile ? (!toggled ? "-96vh" : "") : "",
        }}
        transition={{
          duration: 1.2,
          ease: "easeInOut",
        }}
      />

      <div className="relative w-full h-[70vh] flex justify-center items-center">
        <div
          className={cn(
            "absolute left-4 lg:left-8 xl:left-20 top-1/2 -translate-y-1/2 z-[30]",
            isMobile && "hidden"
          )}
        >
          <AnimatePresence mode="wait">
            {!toggled && circleDone && (
              <motion.div
                key="login-rectangles"
                className="relative"
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div
                  className="absolute -translate-y-[200px] sm:-translate-y-[250px] lg:-translate-y-[300px] left-0 w-[35vw] md:w-[40vw] lg:w-[45vw] h-[200px] sm:h-[250px] lg:h-[320px] rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl backdrop-blur-sm border border-white/10 overflow-hidden"
                  variants={rectangleVariants}
                  transition={{ delay: 0.2 }}
                >
                  <Image
                    src="/edit.png"
                    alt="Edit"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover"
                    quality={90}
                    priority
                    sizes="(max-width: 768px) 35vw, (max-width: 1024px) 40vw, 45vw"
                  />
                </motion.div>

                <motion.div
                  className="absolute -translate-y-[80px] sm:-translate-y-[100px] lg:-translate-y-[120px] left-20 sm:left-32 lg:left-44 w-[30vw] md:w-[35vw] lg:w-[45vw] h-[180px] sm:h-[220px] lg:h-[320px] rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl backdrop-blur-sm border border-white/10 overflow-hidden"
                  variants={rectangleVariants}
                  transition={{ delay: 0.4 }}
                >
                  <Image
                    src="/room.png"
                    alt="Room"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover"
                    quality={90}
                    priority
                    sizes="(max-width: 768px) 30vw, (max-width: 1024px) 35vw, 45vw"
                  />
                </motion.div>

                <motion.div
                  className="absolute translate-y-[80px] sm:translate-y-[100px] lg:translate-y-[120px] w-[28vw] md:w-[32vw] lg:w-[35vw] h-[120px] sm:h-[140px] lg:h-[180px] 
            bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl 
            border border-light-royal-blue/20 shadow-lg lg:shadow-2xl p-4 lg:p-6 flex items-center justify-center"
                  variants={rectangleVariants}
                  transition={{ delay: 0.6 }}
                >
                  <p className="text-darkblue text-center text-xs sm:text-sm lg:text-base font-normal leading-relaxed">
                    <span className="font-semibold text-light-royal-blue">
                      KOKORO
                    </span>{" "}
                    syncs YouTube videos and lets you chat with friends in
                    real-time. Experience seamless watching together with
                    instant messaging and reactions.{" "}
                    <span className="italic text-light-royal-blue">
                      Heart To Heart
                    </span>
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          className={cn(
            "absolute right-4 lg:right-8 xl:right-20 top-1/2 -translate-y-1/2 z-[30]",
            isMobile && "hidden"
          )}
        >
          <AnimatePresence mode="wait">
            {toggled && circleDone && (
              <motion.div
                key="register-rectangles"
                className="relative"
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.div
                  className="absolute -translate-y-[200px] sm:-translate-y-[250px] lg:-translate-y-[300px] right-0 w-[35vw] md:w-[40vw] lg:w-[45vw] h-[200px] sm:h-[250px] lg:h-[320px] rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl backdrop-blur-sm border border-white/10 overflow-hidden"
                  variants={rectangleVariants}
                  transition={{ delay: 0.2 }}
                >
                  <Image
                    src="/message.png"
                    alt="Message"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover"
                    quality={90}
                    priority
                    sizes="(max-width: 768px) 35vw, (max-width: 1024px) 40vw, 45vw"
                  />
                </motion.div>

                <motion.div
                  className="absolute -translate-y-[80px] sm:-translate-y-[100px] lg:-translate-y-[120px] right-20 sm:right-32 lg:right-44 w-[30vw] md:w-[35vw] lg:w-[45vw] h-[180px] sm:h-[220px] lg:h-[320px] rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl backdrop-blur-sm border border-white/10 overflow-hidden"
                  variants={rectangleVariants}
                  transition={{ delay: 0.4 }}
                >
                  <Image
                    src="/roomvid.png"
                    alt="Room Video"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover"
                    quality={90}
                    priority
                    sizes="(max-width: 768px) 30vw, (max-width: 1024px) 35vw, 45vw"
                  />
                </motion.div>

                <motion.div
                  className="absolute translate-y-[80px] sm:translate-y-[100px] lg:translate-y-[120px] right-0 w-[28vw] md:w-[32vw] lg:w-[35vw] h-[120px] sm:h-[140px] lg:h-[180px] 
            bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl 
            border border-plum/20 shadow-lg lg:shadow-2xl p-4 lg:p-6 flex items-center justify-center"
                  variants={rectangleVariants}
                  transition={{ delay: 0.6 }}
                >
                  <p className="text-darkblue text-center text-xs sm:text-sm lg:text-base font-normal leading-relaxed">
                    <span className="font-semibold text-plum">KOKORO</span> lets
                    you create rooms to watch videos together with friends in
                    real-time. Chat, react, and enjoy synchronized streaming
                    experiences that bring people closer.{" "}
                    <span className="italic text-plum">Heart To Heart</span>
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {!toggled && (
            <motion.div
              key="login"
              initial={
                mounted ? (isMobile ? "enterBottom" : "enterLeft") : undefined
              }
              animate="center"
              exit={isMobile ? "exitBottom" : "exitLeft"}
              variants={isMobile ? formVariantsMobile : formVariantsDesktop}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className={cn(
                isMobile
                  ? "w-full max-w-[90%] mx-auto flex justify-center"
                  : "absolute right-4 lg:right-8 xl:right-20 top-1/2 -translate-y-1/2 w-[350px] sm:w-[380px] lg:w-[400px]"
              )}
            >
              <LoginForm onToggle={() => setToggled(true)} />
            </motion.div>
          )}
          {toggled && (
            <motion.div
              key="register"
              initial={
                mounted ? (isMobile ? "enterTop" : "enterRight") : undefined
              }
              animate="center"
              exit={isMobile ? "exitTop" : "exitRight"}
              variants={isMobile ? formVariantsMobile : formVariantsDesktop}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className={cn(
                isMobile
                  ? "w-full max-w-[90%] mx-auto flex justify-center"
                  : "absolute left-4 lg:left-8 xl:left-20 top-1/2 -translate-y-1/2 w-[350px] sm:w-[380px] lg:w-[400px]"
              )}
            >
              <RegisterForm onToggle={() => setToggled(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isMobile && !isSmallMobile && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-3 w-full max-w-[90%]">
          <AnimatePresence mode="wait">
            {circleDone && (
              <motion.div
                key={toggled ? "register-mobile" : "login-mobile"}
                className="relative w-full h-32 sm:h-40 md:h-48"
                initial="hidden"
                animate="visible"
                exit="exit"
              ></motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AuthPanel;
