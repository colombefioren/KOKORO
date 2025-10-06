import api from "@/lib/api";

export const updateBio = async (newBio: string) => {
  try {
    const res = await api.bio.updateUserBio(newBio);
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
