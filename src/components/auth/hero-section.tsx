"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Video, Heart } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-ebony">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-light-royal-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-plum/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        {/* Logo & Slogan */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="p-4 bg-gradient-to-br from-light-royal-blue to-plum rounded-3xl shadow-2xl">
            <img src="/logo.png" alt="Kokoro" className="w-16 h-16" />
          </div>
          <div className="text-left">
            <h1 className="text-5xl md:text-7xl font-bold text-white font-fredoka mb-2">
              Kokoro
            </h1>
            <p className="text-xl text-light-bluish-gray flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink" />
              Heart to Heart
            </p>
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h2
          className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Watch Together.
          <span className="block text-light-royal-blue">Chat Together.</span>
          <span className="block text-plum">Connect Heart to Heart.</span>
        </motion.h2>

        {/* Description */}
        <motion.p
          className="text-xl text-light-bluish-gray max-w-3xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Create beautiful spaces where friends sync up on YouTube videos, share
          reactions in real-time, and build memories together. No more &quot;3, 2, 1,
          play!&quot; - just pure, synchronized connection.
        </motion.p>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-light-royal-blue/20 hover:border-light-royal-blue/40 transition-all duration-300">
            <div className="p-3 bg-light-royal-blue/20 rounded-2xl w-fit mb-4">
              <Video className="w-6 h-6 text-light-royal-blue" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              Sync & Stream
            </h3>
            <p className="text-light-bluish-gray text-sm">
              Watch YouTube videos in perfect sync with your friends. Pause,
              play, and seek together in real-time.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-plum/20 hover:border-plum/40 transition-all duration-300">
            <div className="p-3 bg-plum/20 rounded-2xl w-fit mb-4">
              <MessageCircle className="w-6 h-6 text-plum" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Live Chat</h3>
            <p className="text-light-bluish-gray text-sm">
              Share reactions, jokes, and thoughts as you watch. Experience
              videos together like never before.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-green/20 hover:border-green/40 transition-all duration-300">
            <div className="p-3 bg-green/20 rounded-2xl w-fit mb-4">
              <Users className="w-6 h-6 text-green" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              Create Rooms
            </h3>
            <p className="text-light-bluish-gray text-sm">
              Build private or public rooms. Invite friends or meet new people
              who share your interests.
            </p>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Button className="bg-gradient-to-r from-light-royal-blue to-plum text-white rounded-xl px-8 py-3 text-lg font-semibold hover:translate-y-[-2px] hover:shadow-xl transition-all duration-300">
            Start Watching Free
          </Button>
          <Button
            variant="outline"
            className="bg-white/5 text-white border-light-royal-blue/30 hover:bg-white/10 rounded-xl px-8 py-3 text-lg font-semibold transition-all duration-300"
          >
            Learn More
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
