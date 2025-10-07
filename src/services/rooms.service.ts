import api from "@/lib/api";
import { RoomUpdateInput } from "@/types/room";

export const getRooms = async () => {
  try {
    const res = await api.rooms.getAllRooms();
    if (!res.ok) throw new Error("Failed to fetch rooms");
    return res.json();
  } catch (err) {
    console.error("[getRooms] Error:", err);
    throw err;
  }
};

export const updateRoom = async (id: string, data: RoomUpdateInput) => {
  try {
    const res = await api.rooms.updateRoom(id, data as RoomUpdateInput);
    if (!res.ok) throw new Error("Failed to update room");
    return res.json();
  } catch (err) {
    console.error("[updateRoom] Error:", err);
    throw err;
  }
};

export const deleteRoom = async (id: string) => {
  try {
    const res = await api.rooms.deleteRoom(id);
    if (!res.ok) throw new Error("Failed to delete room");
    return res.json();
  } catch (err) {
    console.error("[deleteRoom] Error:", err);
    throw err;
  }
};

export const toggleRoomFavorite = async (id: string) => {
  try {
    const res = await api.rooms.toggleRoomFavorite(id);
    if (!res.ok) throw new Error("Failed to toggle room favorite");
    return res.json();
  } catch (err) {
    console.error("[toggleRoomFavorite] Error:", err);
    throw err;
  }
};
