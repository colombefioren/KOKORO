import ProfileInfo from "@/components/profile-info";
import { auth } from "@/lib/auth";
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
    <>
      <ProfileInfo />
    </>
  );
};
export default ProfilePage;
