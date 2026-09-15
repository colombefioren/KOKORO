"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const VerifiedContent = () => {
  const searchParams = useSearchParams();
  const hasError = Boolean(searchParams.get("error"));

  if (hasError) {
    return (
      <div className="min-h-screen bg-ebony flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-pink/15 border border-pink/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-pink" />
          </div>
          <h1 className="text-xl font-bold text-white">
            Verification link expired
          </h1>
          <p className="text-light-bluish-gray text-sm">
            That link is invalid or has expired. Sign in and we&rsquo;ll send
            you a fresh one.
          </p>
          <Link
            href="/auth"
            className="inline-block bg-light-royal-blue text-white rounded-xl px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ebony flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-green/15 border border-green/30 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6 text-green" />
        </div>
        <h1 className="text-xl font-bold text-white">Email verified</h1>
        <p className="text-light-bluish-gray text-sm">
          Your account is active. You can sign in now.
        </p>
        <Link
          href="/auth"
          className="inline-block bg-light-royal-blue text-white rounded-xl px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};

const VerifiedPage = () => (
  <Suspense fallback={null}>
    <VerifiedContent />
  </Suspense>
);

export default VerifiedPage;
