import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Vercel impone un techo de 4.5MB por request. No tiene sentido subirlo
      // más arriba: el cliente igual rechaza archivos > 4MB con un mensaje
      // claro antes de hacer el POST.
      bodySizeLimit: "4mb",
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
