export type User = {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  username?: string | null;
  displayUsername?: string | null;
  isOauthUser: boolean;
  isOnline: boolean;
  bio: string;
  createdAt: string;
};

export type FriendRequester = {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  username?: string | null;
  displayUsername?: string | null;
  isOauthUser: boolean;
  isOnline: boolean;
  bio: string;
  receivedAt: string;
};

export type FriendshipStatus = "PENDING" | "ACCEPTED";

export interface FriendRecord {
  id: string;
  requester: User;
  receiver: User;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
}

export type Friend = {
  id: number;
  name: string;
  avatar: string;
  status: string;
  activity: string;
};
