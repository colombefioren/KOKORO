"use client";

import ProfilePanel from "@/components/profile/profile-panel";
import { notFound, useParams } from "next/navigation";

const ProfilePage = () => {
  const params = useParams();

  if (!params.id) return notFound();

  return <ProfilePanel userId={params.id as string} />;
};
export default ProfilePage;
