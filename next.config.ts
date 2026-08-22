import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Google hesabıyla girişte Firebase'in döndürdüğü profil fotoğrafı bu host'tan gelir.
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // TheMealDB tarif fotoğrafları (bkz. lib/mealdb/client.ts).
      { protocol: "https", hostname: "www.themealdb.com" },
    ],
  },
};

export default nextConfig;
