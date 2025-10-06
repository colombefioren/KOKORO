import api from "@/lib/api";

export const getFriends = async () => {
  try {
    const res = await api.friends.getFriends();
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getPendingFriendRequests = async () => {
  try {
    const res = await api.friends.getPendingFriendRequests();
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const sendFriendRequest = async (receiverId: string) => {
  try {
    const res = await api.friends.sendFriendRequest({ receiverId });
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const acceptFriendRequest = async (requesterId: string) => {
  try {
    const res = await api.friends.acceptFriendRequest({ requesterId });
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const declineFriendRequest = async (requesterId: string) => {
  try {
    const res = await api.friends.declineFriendRequest({
      requesterId,
    });
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getFriendRecords = async () => {
  try {
    const res = await api.friends.getFriendshipRecords();
    if (!res.ok) throw new Error("Failed to fetch friend records");
    return res.json();
  } catch (err) {
    console.error("[getFriendRecords] Error:", err);
    throw err;
  }
};
