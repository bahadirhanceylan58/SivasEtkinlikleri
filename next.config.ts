import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // turbopack option is empty and can cause issues if not configured, removing for safety or keeping as is? 
  // keeping as is but empty object might be useless.
  turbopack: {},
};

export default withPWA(nextConfig);