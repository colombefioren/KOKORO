"use client";

import ProfilePanel from "@/components/profile/profile-panel";
import { useParams } from "next/navigation";

const ProfilePage = () => {
  const params = useParams();

  return <ProfilePanel userId={params.id as string} />;
};
export default ProfilePage;
