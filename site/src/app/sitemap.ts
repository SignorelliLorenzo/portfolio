import fs from "fs/promises";
import path from "path";
import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/seo";

const BASE_PATHS = ["", "/contact", "/projects"];
const PROJECTS_DIR = path.join(process.cwd(), "public", "projects");

async function getProjectIds(): Promise<string[]> {
  try {
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  } catch {
    return [];
  }
}

function localizedUrl(locale: string, pathname: string): string {
  return `${siteUrl}/${locale}${pathname}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const projectIds = await getProjectIds();
  const map: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const pathname of BASE_PATHS) {
      map.push({
        url: localizedUrl(locale, pathname),
        lastModified: now,
        changeFrequency: pathname === "" ? "weekly" : "monthly",
        priority: pathname === "" ? 1 : 0.8,
      });
    }

    for (const id of projectIds) {
      map.push({
        url: localizedUrl(locale, `/projects/${id}`),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return map;
}
