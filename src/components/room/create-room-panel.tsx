"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import CreateRoomForm from "./create-room-form";
import RoomTypeInfo from "./room-type-info";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createRoom } from "@/services/rooms.service";
import { useSocketStore } from "@/store/useSocketStore";
import { useUserStore } from "@/store/useUserStore";

const CreateRoomPanel = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const socket = useSocketStore((state) => state.socket);
  const currentUser = useUserStore((state) => state.user);

  const handleSubmit = async (data: {
    roomName: string;
    roomDescription: string;
    roomType: string;
    memberIds: string[];
    maxMembers: number;
  }) => {
    try {
      setIsLoading(true);

      const roomTypeMap = {
        public: "PUBLIC",
        private: "PRIVATE",
        friends: "FRIENDS",
      } as const;

      const roomData = {
        name: data.roomName,
        description: data.roomDescription,
        type: roomTypeMap[data.roomType as keyof typeof roomTypeMap],
        memberIds: data.memberIds,
        maxMembers: data.maxMembers,
      };
      const createdRoom = await createRoom(roomData);

      toast.success("Room created successfully!");
      router.push(`/rooms/${createdRoom.id}`);
      if (createdRoom.type === "PUBLIC" || createdRoom.type === "FRIENDS") {
        socket?.emit("create-public-room", createdRoom);
      }
      for (let i = 0; i < data.memberIds.length; i++) {
        socket?.emit("invited-to-room", {
          room: createdRoom,
          userId: data.memberIds[i],
        });
      }
    } catch (error) {
      console.error("Failed to create room:", error);
      toast.error("Failed to create room. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen mx-2 sm:mx-4 lg:mx-10 flex justify-center relative py-8 lg:py-12 px-2 sm:px-4">
      <Button
        onClick={() => router.push("/")}
        className="bg-white/5 absolute left-2 sm:left-4 top-4 lg:top-10 text-white border-light-royal-blue/30 hover:bg-white/10 hover:border-light-royal-blue/50 rounded-xl px-3 sm:px-4 py-2 text-sm font-semibold transition-all duration-300 mb-6 z-10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <div className="w-full mx-auto mt-16 lg:mt-0 max-w-7xl">
        <div className="text-center mb-6 lg:mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-white font-fredoka">
              Create New Room
            </h1>
          </div>
          <p className="text-light-bluish-gray text-sm px-2">
            Build your perfect space for hanging out with friends
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <CreateRoomForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
              currentUser={currentUser}
            />
          </div>

          <div className="hidden lg:block">
            <RoomTypeInfo />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomPanel;
