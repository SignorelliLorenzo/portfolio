import fs from "fs/promises";
import path from "path";
import { Project } from "@/lib/models/project";
import { Locale, defaultLocale } from "@/lib/i18n";

interface ProjectMeta {
  title: string;
  shortDescription: string;
  shortDescriptionIt?: string | null;
  tags?: string[];
  github?: string | null;
  demo?: string | null;
  features?: string[];
  featuresIt?: string[];
  featured?: boolean;
  cover?: string;
  order?: number;
}

const PROJECTS_DIR = path.join(process.cwd(), "public", "projects");

const SUPPORTED_IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"]);

async function resolveCoverImage(projectId: string, meta: ProjectMeta): Promise<string | null> {
  const assetsDir = path.join(PROJECTS_DIR, projectId, "assets");

  if (meta.cover) {
    return `/projects/${projectId}/assets/${meta.cover}`;
  }

  try {
    const entries = await fs.readdir(assetsDir);
    const preferredPrefixes = ["cover", "hero", "thumbnail", "image"];
    for (const prefix of preferredPrefixes) {
      const found = entries.find((name) => {
        const ext = path.extname(name).toLowerCase();
        const base = path.basename(name, ext).toLowerCase();
        return SUPPORTED_IMAGE_EXTS.has(ext) && base === prefix;
      });
      if (found) return `/projects/${projectId}/assets/${found}`;
    }
    const first = entries.find((name) =>
      SUPPORTED_IMAGE_EXTS.has(path.extname(name).toLowerCase())
    );
    if (first) return `/projects/${projectId}/assets/${first}`;
  } catch {
    // no assets directory
  }

  return null;
}

async function loadProject(projectId: string, locale: Locale): Promise<Project | null> {
  const projectDir = path.join(PROJECTS_DIR, projectId);
  const metaPath = path.join(projectDir, "meta.json");

  try {
    const metaRaw = await fs.readFile(metaPath, "utf-8");
    const meta: ProjectMeta = JSON.parse(metaRaw);

    const mdFile = locale === "it" ? "it.md" : "en.md";
    const mdFallback = "en.md";
    let markdown: string | null = null;
    try {
      markdown = await fs.readFile(path.join(projectDir, mdFile), "utf-8");
    } catch {
      if (locale !== defaultLocale) {
        try {
          markdown = await fs.readFile(path.join(projectDir, mdFallback), "utf-8");
        } catch {
          // no markdown
        }
      }
    }

    let markdownIt: string | null = null;
    try {
      markdownIt = await fs.readFile(path.join(projectDir, "it.md"), "utf-8");
    } catch {
      // no Italian markdown
    }

    const hasItalianTranslation = Boolean(
      meta.shortDescriptionIt || markdownIt || meta.featuresIt
    );

    const image = await resolveCoverImage(projectId, meta);

    return {
      id: projectId,
      title: meta.title,
      shortDescription:
        locale === "it" ? meta.shortDescriptionIt ?? meta.shortDescription : meta.shortDescription,
      image,
      tags: meta.tags ?? [],
      markdown,
      github: meta.github ?? null,
      demo: meta.demo ?? null,
      features:
        locale === "it" ? meta.featuresIt ?? meta.features ?? null : meta.features ?? null,
      featured: Boolean(meta.featured),
      hasItalianTranslation,
    };
  } catch {
    return null;
  }
}

export async function fetchProjects(locale: Locale = defaultLocale): Promise<Project[]> {
  try {
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

    const projects: (Project & { _order?: number })[] = [];
    for (const dir of dirs) {
      const project = await loadProject(dir, locale);
      if (project) {
        // Read order from meta for sorting
        try {
          const metaRaw = await fs.readFile(
            path.join(PROJECTS_DIR, dir, "meta.json"),
            "utf-8"
          );
          const meta: ProjectMeta = JSON.parse(metaRaw);
          (project as any)._order = meta.order ?? 999;
        } catch {
          (project as any)._order = 999;
        }
        projects.push(project as Project & { _order?: number });
      }
    }

    projects.sort((a, b) => (a._order ?? 999) - (b._order ?? 999));

    // Strip internal _order field
    return projects.map(({ _order, ...rest }) => rest);
  } catch (error) {
    console.error("Failed to load projects from filesystem", error);
    return [];
  }
}

export async function fetchProjectById(
  id: string,
  locale: Locale = defaultLocale
): Promise<Project | undefined> {
  if (!id) return undefined;
  const project = await loadProject(id, locale);
  return project ?? undefined;
}
