import AuthPanel from "@/components/auth/auth-panel";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const AuthPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/profile");
  }

  return (
    <>
      <AuthPanel />
    </>
  );
};
export default AuthPage;
