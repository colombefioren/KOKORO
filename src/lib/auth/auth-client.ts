import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [usernameClient()],
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  updateUser,
  changeEmail,
  changePassword,
  sendVerificationEmail,
} = authClient;
