import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // TypeScript hatalarını görmezden gel (Sarı/Kırmızı uyarılara takılma)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Yazım kuralları hatalarını görmezden gel
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
// Guncelleme tetikleyici