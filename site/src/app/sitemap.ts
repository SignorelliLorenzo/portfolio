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

function alternateLanguages(pathname: string): Record<string, string> {
  return {
    en: localizedUrl("en", pathname),
    it: localizedUrl("it", pathname),
    "x-default": localizedUrl("en", pathname),
  };
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
        alternates: {
          languages: alternateLanguages(pathname),
        },
      });
    }

    for (const id of projectIds) {
      const projectPath = `/projects/${id}`;
      map.push({
        url: localizedUrl(locale, projectPath),
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: alternateLanguages(projectPath),
        },
      });
    }
  }

  return map;
}
