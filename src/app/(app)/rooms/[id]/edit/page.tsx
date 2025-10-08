"use server";
import EditRoomPanel from "@/components/room/edit-room-panel";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const EditRoomPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  return <EditRoomPanel />;
};
export default EditRoomPage;
