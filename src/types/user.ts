export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  username?: string | null;
  displayUsername?: string | null;
  isOauthUser: boolean;
  isOnline: boolean;
  bio: string;
};

export type FriendRequester =  {
id: string;
  firstName: string;
  lastName: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  username?: string | null;
  displayUsername?: string | null;
  isOauthUser: boolean;
  isOnline: boolean;
  bio: string;
  receivedAt: string;
}

