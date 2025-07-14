import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Faspay - Modern Banking",
    short_name: "Faspay",
    description: "Your trusted digital banking partner for seamless financial transactions",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#FFD700",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["finance", "business"],
    screenshots: [
      {
        src: "/screenshot-mobile.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
  }
}
