import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cancha Smart — Panel de control",
    short_name: "Cancha Smart",
    description: "Costos, mensualidades y ganancia por cliente de Cancha Smart.",
    start_url: "/",
    display: "standalone",
    background_color: "#050a30",
    theme_color: "#050a30",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
