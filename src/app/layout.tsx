import type { Metadata } from "next";
import { Nunito, Poppins, Fredoka } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import ProfileInitializer from "@/components/profile-initializer";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400"],
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
        className={`${nunito.variable} ${poppins.variable} ${fredoka.variable} antialiased`}
        style={{
          fontFamily:
            "var(--font-poppins), var(--font-nunito), var(--font-fredoka), sans-serif",
        }}
      >
        <ProfileInitializer />
        {children}

        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
