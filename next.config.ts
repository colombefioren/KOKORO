import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "ivuyjpkyrnqktujohzym.supabase.co",
      "i.ytimg.com",
      "avatar.iran.liara.run",
    ],
  },
};

export default nextConfig;
