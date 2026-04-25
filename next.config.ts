import type { NextConfig } from "next";

// URL del deploy de lumen-3d en Vercel.
// Reemplazar después de hacer el primer deploy con la URL real
// que devuelve Vercel (ej: https://lumen-3d-pablocuadros.vercel.app)
const LUMEN_3D_URL = process.env.LUMEN_3D_URL || 'https://lumen3-d.vercel.app';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/3d',
        destination: `${LUMEN_3D_URL}/3d`,
      },
      {
        source: '/3d/:path*',
        destination: `${LUMEN_3D_URL}/3d/:path*`,
      },
    ];
  },
};

export default nextConfig;
