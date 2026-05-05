import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
