import NotificationsPage from "@/components/notifications/notifications-page";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const NotificationsRoute = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  return <NotificationsPage />;
};

export default NotificationsRoute;
