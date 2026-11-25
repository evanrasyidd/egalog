import type { MetadataRoute } from "next";
import { getOpenJobPostings } from "@/lib/recruitment";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://egalog.co.id";

export default function sitemap(): MetadataRoute.Sitemap {
  const postings = getOpenJobPostings();

  return [
    {
      url: `${SITE_URL}/karir`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...postings.map((job) => ({
      url: `${SITE_URL}/karir/lowongan/${job.id}`,
      lastModified: new Date(job.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
