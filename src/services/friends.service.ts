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

export const acceptFriendRequest = async (friendshipId: string) => {
  try {
    const res = await api.friends.acceptFriendRequest({ friendshipId });
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const declineFriendRequest = async (friendshipId: string) => {
  try {
    const res = await api.friends.declineFriendRequest({
      friendshipId,
    });
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};
