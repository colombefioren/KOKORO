"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import CreateRoomForm from "./create-room-form";
import RoomTypeInfo from "./room-type-info";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createRoom } from "@/services/rooms.service";

const CreateRoomPanel = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen mx-10 flex justify-center relative py-12">
      <Button
        onClick={() => router.push("/")}
        className="bg-white/5 absolute left-0 top-10 text-white border-light-royal-blue/30 hover:bg-white/10 hover:border-light-royal-blue/50 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Rooms Center
      </Button>
      <div className="w-full mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-white font-fredoka">
              Create New Room
            </h1>
          </div>
          <p className="text-light-bluish-gray text-sm">
            Build your perfect space for hanging out with friends
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CreateRoomForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </div>

          <RoomTypeInfo />
        </div>
      </div>
    </div>
  );
};

export default CreateRoomPanel;
