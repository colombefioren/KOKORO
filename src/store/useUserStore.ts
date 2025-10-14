import { create } from "zustand";

type UserState = {
  user: {
    id: string;
    name:string;
    firstName: string;
    lastName: string;
    email: string;
    image?: string | null;
    emailVerified: boolean;
    username?: string | null;
    displayUsername?: string | null;
    isOauthUser: boolean;
    bio: string;
    createdAt: string;
  } | null;
  isLoadingUser: boolean;
  setLoadingUser: (isLoadingUser: boolean) => void;
  setUser: (user: UserState["user"]) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoadingUser: false,
  isLoadingProfilePic: false,
  setLoadingUser: (isLoadingUser: boolean) => set({ isLoadingUser }),
  setUser: (user: UserState["user"]) => set({ user }),
}));
