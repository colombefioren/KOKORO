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

export const getRoomById = async (id: string) => {
  try {
    const res = await api.rooms.getRoomById(id);
    if (!res.ok) throw new Error("Failed to fetch room");
    return res.json();
  } catch (err) {
    console.error("[getRoomById] Error:", err);
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

export const leaveRoom = async (roomId: string) => {
  try {
    const res = await api.rooms.leaveRoom(roomId);
    if (!res.ok) throw new Error("Failed to leave room");
    return res.json();
  } catch (err) {
    console.error("[leaveRoom] Error:", err);
    throw err;
  }
};
export const createRoom = async (data: {
  name: string;
  description?: string;
  type: "PUBLIC" | "PRIVATE" | "FRIENDS";
  memberIds?: string[];
  maxMembers?: number;
}) => {
  try {
    const res = await api.rooms.createRoom(data);
    if (!res.ok) throw new Error("Failed to create room");
    return res.json();
  } catch (err) {
    console.error("[createRoom] Error:", err);
    throw err;
  }
};

type RoomUpdateRequest = RoomUpdateInput & {
  memberIds?: string[];
};

export const updateRoom = async (id: string, data: RoomUpdateRequest) => {
  try {
    const res = await api.rooms.updateRoom(id, data);
    if (!res.ok) throw new Error("Failed to update room");
    return res.json();
  } catch (err) {
    console.error("[updateRoom] Error:", err);
    throw err;
  }
};

export const joinRoom = async (roomId: string) => {
  try {
    const res = await api.rooms.joinRoom(roomId);

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to join room");
    }

    return res.json();
  } catch (err) {
    console.error("[joinRoom] Error:", err);
    throw err;
  }
};

export const getUserHostedRooms = async (userId: string) => {
  try {
    const res = await   api.rooms.getHostedRoomsByUserId(userId);
    if (!res.ok) throw new Error("Failed to fetch hosted rooms");
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};


export const updatePreviousVideo = async (roomId: string, previousVideoId: string, currentVideoId?: string) => {
  try {
    const res = await api.rooms.updateRoomPreviousVideo(roomId, { previousVideoId, currentVideoId });
    if (!res.ok) throw new Error("Failed to update previous video");
    return res.json();
  } catch (err) {
    console.error("[updatePreviousVideo] Error:", err);
    throw err;
  }
};

export const getRoomVideoState = async (roomId: string) => {
  try {
    const res = await api.rooms.getRoomVideoState(roomId);
    if (!res.ok) throw new Error("Failed to fetch room video state");
    return res.json();
  } catch (err) {
    console.error("[getRoomVideoState] Error:", err);
    throw err;
  }
};