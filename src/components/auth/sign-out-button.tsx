"use client";

import { signOut } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SignOutButton = () => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    await signOut({
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
        onSuccess: () => {
          toast.success("Signed out successfully");
          router.push("/auth");
        },
      },
    });
  };

  return (
    <Button disabled={isPending} onClick={handleClick} className="bg-red-500 w-fit hover:bg-red-600">
      Sign Out
    </Button>
  );
};
export default SignOutButton;
