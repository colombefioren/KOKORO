import type { Metadata } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ProfileInitializer from "@/components/profile-initializer";
import QueryProvider from "@/providers/query-provider";

const schibstedGrotesk = Schibsted_Grotesk({
  variable: "--font-schibsted-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "KOKORO | Heart To Heart",
  description:
    "A place where users can create rooms, chat, and interact in real-time.",
  icons: "/logo.png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${schibstedGrotesk.variable} antialiased`}
        style={{
          fontFamily: "var(--font-schibsted-grotesk), sans-serif",
        }}
      >
        <QueryProvider>
          <ProfileInitializer />
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
