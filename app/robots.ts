import type { MetadataRoute } from "next";
import { profile } from "@/content/profile";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/lab/" },
    sitemap: new URL("/sitemap.xml", profile.siteUrl).toString(),
  };
}
