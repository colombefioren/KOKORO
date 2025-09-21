import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { username } from "better-auth/plugins/username";
import { validator } from "validation-better-auth";
import {
  emailLoginSchema,
  registerBetterAuthSchema,
  usernameLoginSchema,
} from "./validations/auth";
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    passwordPolicy: {
      minLength: 6,
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  appName: "Kokoro",
  plugins: [
    username(),
    validator([
      {
        path: "sign-up/email",
        schema: registerBetterAuthSchema,
      },
      {
        path: "sign-in/email",
        schema: emailLoginSchema,
      },
      {
        path: "sign-in/username",
        schema: usernameLoginSchema,
      },
    ]),
  ],
});
