import { create } from "zustand";

type UserState = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    image?: string | null;
    emailVerified: boolean;
    username?: string | null;
    displayUsername?: string | null;
  } | null;
  isLoadingUser: boolean;
  setLoadingUser: (isLoadingUser: boolean) => void;
  isLoadingProfilePic: boolean;
  setLoadingProfilePic: (isLoadingProfilePic: boolean) => void;
  setUser: (user: UserState["user"]) => void;
  setProfilePic: (profilePic: string) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoadingUser: false,
  isLoadingProfilePic: false,
  setLoadingUser: (isLoadingUser: boolean) => set({ isLoadingUser }),
  setLoadingProfilePic: (isLoadingProfilePic: boolean) =>
    set({ isLoadingProfilePic }),
  setUser: (user: UserState["user"]) => set({ user }),
  setProfilePic: (profilePic: string) =>
    set((state) => ({
      user: state.user ? { ...state.user, image: profilePic } : null,
    })),
}));
