import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";
const authClient = createAuthClient({
  baseURL: process.env.NEXT_API_BASE_URL,
  plugins:[
    usernameClient()
  ]
});

export const {signIn,signOut,signUp} = authClient;
