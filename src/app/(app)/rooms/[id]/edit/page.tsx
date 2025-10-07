"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EditRoomForm from "@/components/room/edit-room-form";
import RoomTypeInfo from "@/components/room/room-type-info";
import { getRoomById, updateRoom, deleteRoom } from "@/services/rooms.service";
import { RoomRecord } from "@/types/room";
import { useUserStore } from "@/store/useUserStore";

const EditRoomPage = () => {
  const router = useRouter();
  const params = useParams();
  const [room, setRoom] = useState<RoomRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = useUserStore((state) => state.user);
  const isHost =
    room?.members.some(
      (member) => member.userId === user?.id && member.role === "HOST"
    ) || false;

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const roomData = await getRoomById(params.id as string);
        setRoom(roomData);
      } catch (error) {
        console.error("Failed to fetch room:", error);
        toast.error("Failed to load room data");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchRoom();
    }
  }, [params.id]);

  const handleSubmit = async (data: {
    name: string;
    description: string;
    type: string;
    memberIds: string[];
  }) => {
    try {
      setIsLoading(true);

      const updateData = data;

      await updateRoom(params.id as string, updateData);

      toast.success("Room updated successfully!");
      router.push(`/rooms/${params.id}`);
    } catch (error) {
      console.error("Failed to update room:", error);
      toast.error("Failed to update room. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this room? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteRoom(params.id as string);
      toast.success("Room deleted successfully!");
      router.push("/");
    } catch (error) {
      console.error("Failed to delete room:", error);
      toast.error("Failed to delete room. Please try again.");
    }
  };

  const handleCancel = () => {
    router.push(`/rooms/${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-light-blue text-lg">Loading room...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Room not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mx-10 flex justify-center relative py-12">
      <Button
        onClick={() => router.push(`/rooms/${params.id}`)}
        className="bg-white/5 absolute left-0 top-10 text-white border-light-royal-blue/30 hover:bg-white/10 hover:border-light-royal-blue/50 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Room
      </Button>
      <div className="w-full mx-auto">
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-white font-fredoka">
              Edit Room
            </h1>
          </div>
          <p className="text-light-bluish-gray text-sm">
            Update your room settings and members
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <EditRoomForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              onDelete={handleDeleteRoom}
              initialData={{
                roomName: room.name,
                roomDescription: room.description || "",
                roomType: room.type.toLowerCase(),
                members: room.members.map((member) => member.user),
              }}
              isLoading={isLoading}
              isHost={isHost}
            />
          </div>

          <RoomTypeInfo />
        </div>
      </div>
    </div>
  );
};

export default EditRoomPage;
