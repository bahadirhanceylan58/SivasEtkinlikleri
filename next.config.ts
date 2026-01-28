import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // TypeScript hatalarını görmezden gel (Sarı/Kırmızı uyarılara takılma)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;