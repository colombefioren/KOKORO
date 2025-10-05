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
  bio: string;
};
