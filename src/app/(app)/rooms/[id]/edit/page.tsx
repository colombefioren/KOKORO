"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EditRoomForm from "@/components/room/edit-room-form";
import RoomTypeInfo from "@/components/room/room-type-info";

const EditRoomPage = () => {
  const router = useRouter();

  const handleSubmit = (data: {
    roomName: string;
    roomDescription: string;
    roomType: string;
    memberIds: string[];
  }) => {
    console.log("Room updated:", data);
    router.push(`/rooms/${"room-id"}`);
  };

  const handleCancel = () => {
    router.push(`/rooms/${"room-id"}`);
  };

  return (
    <div className="min-h-screen mx-10 flex justify-center relative py-12">
      <Button
        onClick={() => router.push(`/rooms/${"room-id"}`)}
        className="bg-white/5 absolute left-0 top-10 text-white border-light-royal-blue/30 hover:bg-white/10 hover:border-light-royal-blue/50 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Room
      </Button>
      <div className="w-full mx-auto">
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-white font-fredoka">Edit Room</h1>
          </div>
          <p className="text-light-bluish-gray text-sm">Update your room settings and members</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EditRoomForm onSubmit={handleSubmit} onCancel={handleCancel} />
          </div>
          
          <RoomTypeInfo />
        </div>
      </div>
    </div>
  );
};

export default EditRoomPage;