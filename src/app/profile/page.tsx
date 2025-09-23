import ProfileInfo from "@/components/profile/profile-info";
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
    <div className="flex flex-col w-full items-center justify-between space-y-4">
      <ProfileInfo />
    </div>
  );
};
export default ProfilePage;
