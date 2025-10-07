"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Heart } from "lucide-react";
import Image from "next/image";
import MainLayout from "@/components/layout/main-layout";

export default function NotFound() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="p-4 bg-gradient-to-br from-light-royal-blue/20 to-plum/20 rounded-3xl border border-light-royal-blue/30">
              <Image
                src="/logo.png"
                alt="Kokoro"
                width={100}
                height={100}
                className=" object-contain"
              />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-white font-fredoka">
                Kokoro
              </h1>
              <p className="text-light-bluish-gray text-md flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink" />
                Heart To Heart
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-darkblue/50 to-bluish-gray/30 rounded-3xl p-12 border border-light-royal-blue/20 shadow-2xl backdrop-blur-sm mb-8">
            <div className="mb-8">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-light-royal-blue to-plum bg-clip-text font-fredoka mb-4">
                Page Not Found
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-light-royal-blue to-plum rounded-full mx-auto mb-6"></div>
              <p className="text-light-bluish-gray text-md max-w-md mx-auto">
                Oops! The page you&apos;re looking for seems to have wandered
                off into the digital void.
              </p>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => router.back()}
              className="bg-white/10 text-white border-light-royal-blue/30 hover:bg-white/20 hover:border-light-royal-blue/50 rounded-2xl px-8 py-4 text-md font-semibold transition-all duration-300 hover:scale-105 group"
            >
              <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
              Go Back
            </Button>
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-light-royal-blue to-plum text-white rounded-2xl px-8 py-4 text-md font-semibold hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-lg group"
            >
              <Home className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
              Return Home
            </Button>
          </div>

          <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-light-royal-blue/20">
            <p className="text-light-bluish-gray text-sm flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-pink" />
              Lost but not alone - Kokoro connects hearts everywhere
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
