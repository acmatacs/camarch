import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow external image sources
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
    // Wikimedia blocks Next.js image proxy — serve external images directly
    unoptimized: true,
  },
};

export default nextConfig;
