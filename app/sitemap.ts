import type { MetadataRoute } from "next";
import { getCarts } from "@/lib/carts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://nammathalluvandi.in";
  
  const staticPages = [
    { url: "", priority: 1.0, changeFrequency: "weekly" as const },
    { url: "/explore", priority: 0.9, changeFrequency: "weekly" as const },
    { url: "/publish", priority: 0.9, changeFrequency: "weekly" as const },
    { url: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { url: "/how-it-works", priority: 0.7, changeFrequency: "monthly" as const },
  ];

  const allCarts = await getCarts();

  const dynamicPages = allCarts.map((cart) => ({
    url: `/carts/${cart.id}`,
    priority: 0.8,
    changeFrequency: "weekly" as const,
  }));

  const allPages = [...staticPages, ...dynamicPages];

  return allPages.map((page) => ({
    url: `${base}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
