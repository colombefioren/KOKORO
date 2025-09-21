"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 w-sm mx-auto mt-30">
      <h1 className="text-center font-bold text-xl">Home</h1>
      <Button onClick={() => router.push("auth")}>Get started</Button>
    </div>
  );
};
export default Page;
