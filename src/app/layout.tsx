import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ProfileInitializer from "@/components/profile/profile-initializer";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kokoro",
  description:
    "A place where users can create rooms, chat, and interact in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rubik.variable} antialiased`}>
        <ProfileInitializer />
        {children}

        <Toaster />
      </body>
    </html>
  );
}
