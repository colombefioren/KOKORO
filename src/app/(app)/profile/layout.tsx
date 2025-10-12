"use server";

import FriendsSidebar from "@/components/profile/friends-sidebar";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";



interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default async function ProfileLayout({ children }: ProfileLayoutProps) {

const session = await auth.api.getSession({
  headers: await headers(),
})

if(!session){
  redirect("/auth");
}
  return (
    <div className="min-h-screen flex">
      <div className="flex-1">
        {children}
      </div>
      <div className="w-80"></div>
      <div className="w-80 fixed right-18 top-0 h-screen">
        <FriendsSidebar currentUserId={session.user.id || ""} />
      </div>
    </div>
  );
}