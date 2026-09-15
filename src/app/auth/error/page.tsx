"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_token: "That verification link is invalid or has expired.",
  expired_token: "That verification link has expired. Request a new one.",
  account_not_linked:
    "This account is already linked with a different sign-in method.",
  email_not_verified: "Please verify your email address before signing in.",
  invalid_callback_url: "That link is no longer valid.",
  signup_disabled: "New sign-ups are currently disabled.",
};

const AuthErrorContent = () => {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error")?.toLowerCase() ?? null;
  const message =
    (errorCode && ERROR_MESSAGES[errorCode]) ||
    "Something went wrong while signing you in. Please try again.";

  return (
    <div className="min-h-screen bg-ebony flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-pink/15 border border-pink/30 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-pink" />
        </div>
        <h1 className="text-xl font-bold text-white">Sign-in failed</h1>
        <p className="text-light-bluish-gray text-sm">{message}</p>
        <Link
          href="/auth"
          className="inline-block bg-light-royal-blue text-white rounded-xl px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
};

const AuthErrorPage = () => (
  <Suspense fallback={null}>
    <AuthErrorContent />
  </Suspense>
);

export default AuthErrorPage;
