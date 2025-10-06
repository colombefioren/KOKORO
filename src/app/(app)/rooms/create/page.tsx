"use server";
import CreateRoomPanel from "@/components/room/create-room-panel";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const CreateRoomPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  return <CreateRoomPanel />;
};
export default CreateRoomPage;
