import ChatPanel from "@/components/chat/chat-panel";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const ProfilePage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  return (
      <ChatPanel userId={session.user.id}/>
  );
};
export default ProfilePage;
