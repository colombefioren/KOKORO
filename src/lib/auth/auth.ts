import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../db/prisma";
import { username } from "better-auth/plugins/username";
import { validator } from "validation-better-auth";
import {
  emailLoginSchema,
  registerBetterAuthSchema,
  usernameLoginSchema,
} from "../validation/auth";
import { nextCookies } from "better-auth/next-js";
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    changeEmail: {
      enabled: true,
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      getUserInfo: async (token) => {
        const response = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
            },
          }
        );
        const profile = await response.json();
        return {
          user: {
            id: profile.id,
            name: profile.name,
            username: `${profile.given_name.trim().toLowerCase()}${profile.id}`,
            displayUsername: `${profile.given_name.trim().toLowerCase()}${
              profile.id
            }`,
            email: profile.email,
            image: profile.picture,
            emailVerified: profile.verified_email,
          },
          data: profile,
        };
      },
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      getUserInfo: async (token) => {
        const response = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
            Accept: "application/vnd.github+json",
          },
        });

        const profile = await response.json();

        let email = profile.email;
        if (!email) {
          const emailRes = await fetch("https://api.github.com/user/emails", {
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
              Accept: "application/vnd.github+json",
            },
          });
          const emails = await emailRes.json();
          email = emails[0]?.email || null;
        }

        return {
          user: {
            id: profile.id.toString(),
            name: profile.name || profile.login,
            username: profile.login,
            displayUsername: profile.login,
            email,
            image: profile.avatar_url,
            emailVerified: !!email,
          },
          data: profile,
        };
      },
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
      getUserInfo: async (token) => {
        const response = await fetch(
          "https://graph.facebook.com/me?fields=id,name,email,picture",
          {
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
            },
          }
        );

        const profile = await response.json();

        return {
          user: {
            id: profile.id,
            name: profile.name,
            username: `${profile.name.replace(/\s+/g, "").toLowerCase()}${
              profile.id
            }`,
            displayUsername: profile.name,
            email: profile.email,
            image: profile.picture?.data?.url,
            emailVerified: !!profile.email,
          },
          data: profile,
        };
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github", "facebook"],
    },
  },
  appName: "Kokoro",
  plugins: [
    username(),
    nextCookies(),
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
