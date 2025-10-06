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

export type Friend =  {
  id: number;
  name: string;
  avatar: string;
  status: string;
  activity: string;
}
