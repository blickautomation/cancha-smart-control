import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Esta app es 100% dinámica (auth por cookie, datos financieros en vivo, un solo usuario):
   * no hay nada que valga la pena prerenderizar estáticamente, así que Cache Components
   * (el sucesor de PPR) queda apagado en vez de anotar cada ruta con Suspense/"use cache".
   */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
