"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { SiGithub, SiGoogle, SiFacebook } from "react-icons/si";
import { Loader } from "lucide-react";

interface SignOauthButtonProps {
  provider: "google" | "github" | "facebook";
}

const SignOauthButton = ({ provider }: SignOauthButtonProps) => {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    await signIn.social({
      provider,
      callbackURL: "/",
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
      icon: <SiGoogle className="w-4 h-4" />,
      hover: "hover:bg-[#DB4437]/20 hover:border-[#DB4437]/40",
      name: "Google",
    },
    github: {
      icon: <SiGithub className="w-4 h-4" />,
      hover: "hover:bg-[#2DA44E]/20 hover:border-[#2DA44E]/40",
      name: "GitHub",
    },
    facebook: {
      icon: <SiFacebook className="w-4 h-4" />,
      hover: "hover:bg-[#1877F2]/20 hover:border-[#1877F2]/40",
      name: "Facebook",
    },
  };

  const config = providerConfig[provider];

  return (
    <button
      className={`
        w-12 h-12 cursor-pointer rounded-xl flex items-center justify-center
        bg-white/5 border border-light-royal-blue/20 text-light-bluish-gray
        transition-all duration-300 hover:scale-110 hover:text-white
        focus:outline-none focus:ring-2 focus:ring-light-royal-blue/20
        disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
        ${config.hover}
      `}
      onClick={handleClick}
      disabled={isPending}
      aria-label={`Sign in with ${config.name}`}
    >
      {isPending ? <Loader className="w-4 h-4 animate-spin" /> : config.icon}
    </button>
  );
};

export default SignOauthButton;
