import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fallback for node modules when running on the client (browser)
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        "fs/promises": false,
        net: false,
        tls: false,
        crypto: false,
        dns: false,
        child_process: false,
      };
    }
    return config;
  },
};

export default nextConfig;
