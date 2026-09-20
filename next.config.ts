import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "60mb",
    },
  },
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "ivuyjpkyrnqktujohzym.supabase.co",
      "i.ytimg.com",
      "avatar.iran.liara.run",
      "upload.wikimedia.org",
    ],
    unoptimized: true,
  },
};

export default nextConfig;
