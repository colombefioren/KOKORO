"use client";

import { useRouter } from "next/navigation";
import CreateRoomForm from "./create-room-form";
import RoomTypeInfo from "./room-type-info";
import CreateRoomHeader from "./create-room-header";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";

const CreateRoomPanel = () => {
  const router = useRouter();

  const handleSubmit = (data: {
    roomName: string;
    roomDescription: string;
    roomType: string;
  }) => {
    console.log("Room created:", data);
    router.push("/");
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen mx-10 flex justify-center relative py-12 ">
         <Button
        onClick={() => router.push("/")}
        className="bg-white/5 absolute left-0 top-10 text-white border-light-royal-blue/30 hover:bg-white/10 hover:border-light-royal-blue/50 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Rooms Center
      </Button>
      <div className="w-full mx-auto">
        <CreateRoomHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CreateRoomForm onSubmit={handleSubmit} onCancel={handleCancel} />
          </div>
          
          <RoomTypeInfo />
        </div>
      </div>
    </div>
  );
};

export default CreateRoomPanel;