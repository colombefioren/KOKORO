import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL: process.env.NEXT_API_BASE_URL,
});

export const {signIn,signOut,signUp} = authClient;
