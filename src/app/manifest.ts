import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dealo",
    short_name: "Dealo",
    description: "Discover local deals worth going out for.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f8f4",
    theme_color: "#196b45",
    lang: "en-GB",
    categories: ["shopping", "lifestyle", "food"],
  };
}
