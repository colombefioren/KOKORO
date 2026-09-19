import ConnectPage from "@/components/profile/connect-page";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const ConnectRoute = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  return <ConnectPage />;
};

export default ConnectRoute;
