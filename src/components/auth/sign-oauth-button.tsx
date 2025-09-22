"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { SiGithub, SiGoogle, SiFacebook } from "react-icons/si";

interface SignOauthButtonProps {
  provider: "google" | "github" | "facebook";
}

const SignOauthButton = ({ provider }: SignOauthButtonProps) => {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    await signIn.social({
      provider,
      callbackURL: "/profile",
      errorCallbackURL: "/auth",
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    });
  };

  const providerConfig = {
    google: {
      icon: <SiGoogle className="w-5 h-5" />,
      color: "hover:border-red-500 hover:text-red-500",
      name: "Google",
    },
    github: {
      icon: <SiGithub className="w-5 h-5" />,
      color: "hover:border-gray-800 hover:text-gray-800",
      name: "GitHub",
    },
    facebook: {
      icon: <SiFacebook className="w-5 h-5" />,
      color: "hover:border-blue-600 hover:text-blue-600",
      name: "Facebook",
    },
  };

  const config = providerConfig[provider];

  return (
    <button
      className={`
        w-12 h-12 cursor-pointer rounded-full flex items-center justify-center
        bg-white border border-gray-300 transition-all duration-300
        hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-70 disabled:cursor-not-allowed
        ${config.color}
        ${isPending ? "opacity-70 cursor-not-allowed" : ""}
      `}
      onClick={handleClick}
      disabled={isPending}
      aria-label={`Sign in with ${config.name}`}
    >
      {isPending ? (
        <div className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
      ) : (
        config.icon
      )}
    </button>
  );
};

export default SignOauthButton;
