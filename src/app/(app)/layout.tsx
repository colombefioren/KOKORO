"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {

    const session = await auth.api.getSession({
      headers: await headers(),
    })
  
    if(!session){
      redirect("/auth");
    }
  
  return <MainLayout userId={session.user.id}>{children}</MainLayout>;
}
