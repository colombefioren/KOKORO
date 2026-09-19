"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, DoorClosed } from "lucide-react";

const RoomNotFound = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
          <DoorClosed className="w-6 h-6 text-light-bluish-gray" />
        </div>

        <h1 className="text-xl font-semibold text-white mb-2">
          Room not found
        </h1>
        <p className="text-light-bluish-gray text-sm mb-8">
          This room doesn&apos;t exist or may have been deleted.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => router.back()}
            className="bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-xl px-5 py-2.5 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button
            onClick={() => router.push("/")}
            className="bg-light-royal-blue hover:bg-light-royal-blue/90 text-white rounded-xl px-5 py-2.5 text-sm font-medium"
          >
            <Home className="w-4 h-4 mr-2" />
            Browse Rooms
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomNotFound;
