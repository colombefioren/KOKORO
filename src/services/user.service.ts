import api from "@/lib/api";

export const getUser = async () => {
  try {
    const res = await api.user.getUser();
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const updateBio = async (newBio: string) => {
  try {
    const res = await api.bio.updateUserBio(newBio);
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};
