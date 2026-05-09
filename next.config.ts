import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/legal/tratamiento-datos",
        destination: "/legal/privacidad",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
