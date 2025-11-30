import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // allows all HTTPS domains
      },
      {
        protocol: "http",
        hostname: "**", // optional — allows all HTTP domains
      },
    ],
  },
};

export default nextConfig;
