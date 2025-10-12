"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader } from "lucide-react";
import EditRoomForm from "@/components/room/edit-room-form";
import RoomTypeInfo from "@/components/room/room-type-info";
import DeleteRoomModal from "@/components/room/delete-room-modal";
import { getRoomById, updateRoom, deleteRoom } from "@/services/rooms.service";
import { RoomRecord } from "@/types/room";
import { useUserStore } from "@/store/useUserStore";
import { ApiError } from "@/types/api";
import { useSocketStore } from "@/store/useSocketStore";

const EditRoomPanel = () => {
  const router = useRouter();
  const params = useParams();
  const [room, setRoom] = useState<RoomRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const user = useUserStore((state) => state.user);
  const [editLoading, setEditLoading] = useState(false);
  const isHost =
    room?.members.some(
      (member) => member.userId === user?.id && member.role === "HOST"
    ) || false;
  const socket = useSocketStore((state) => state.socket);
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
    maxMembers: number;
  }) => {
    try {
      setEditLoading(true);

      const updateData = data;

      const updatedRoom = await updateRoom(params.id as string, updateData);

      setRoom(updatedRoom);

      toast.success("Room updated successfully!");
      for(const memberId of data.memberIds) {
        socket?.emit("invited-to-room", {room : updatedRoom, userId: memberId });
      }
    } catch (error) {
      console.error("Failed to update room:", error);
      toast.error((error as ApiError).error.error || "Failed to update room");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteRoom(params.id as string);
      toast.success("Room deleted successfully!");
      setIsDeleteModalOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Failed to delete room:", error);
      toast.error("Failed to delete room. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
    }
  };

  const handleCancel = () => {
    router.push(`/rooms/${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader className="w-8 h-8 text-light-royal-blue animate-spin mb-2" />
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
        <div className="text-center mb-10">
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
              onDelete={handleDeleteClick}
              initialData={{
                roomName: room.name,
                roomDescription: room.description || "",
                roomType: room.type.toLowerCase(),
                members: room.members.map((member) => member.user),
                maxMembers: room.maxMembers || 30,
              }}
              isLoading={editLoading}
              isHost={isHost}
            />
          </div>

          <RoomTypeInfo />
        </div>
      </div>

      <DeleteRoomModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default EditRoomPanel;
