import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const ProfileSettingPage = async () => {
  const session = auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  return <div>ProfileSettingPage</div>;
};
export default ProfileSettingPage;
