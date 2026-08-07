import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CookSnap",
    short_name: "CookSnap",
    description:
      "Snap a photo of a food item and get an AI-generated recipe based on your servings and equipment.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf5",
    theme_color: "#f2600c",
  };
}
