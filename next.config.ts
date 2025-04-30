import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "soxvtvrtkofebgnwzrxq.supabase.co",
        pathname: "/storage/v1/object/public/vehicles/**",
      },
    ],
  },
};

export default nextConfig;
