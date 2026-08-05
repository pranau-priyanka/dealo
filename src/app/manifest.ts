import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dealo",
    short_name: "Dealo",
    description: "Discover the best deals in Portugal, together.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f6fa",
    theme_color: "#6e56ff",
    lang: "en-GB",
    categories: ["shopping", "lifestyle", "food"],
  };
}
