import projectsJson from "@/data/projects.json";
import { getDbClient, isDbEnabled } from "@/lib/db";
import { Project } from "@/lib/types";
import { Locale, defaultLocale } from "@/lib/i18n";

interface DbProjectRow {
  id: string;
  title: string;
  short_description: string;
  short_description_it?: string | null;
  tags: string[] | null;
  markdown: string | null;
  markdown_it?: string | null;
  github: string | null;
  demo: string | null;
  features: string[] | null;
  features_it?: string[] | null;
}

interface FallbackProject extends Project {
  shortDescription_it?: string;
  features_it?: string[] | null;
  markdown_it?: string | null;
}

const fallbackProjectsRaw: FallbackProject[] = projectsJson as FallbackProject[];

function mapFallbackProject(project: FallbackProject, locale: Locale = defaultLocale): Project {
  return {
    id: project.id,
    title: project.title,
    shortDescription:
      locale === "it" && project.shortDescription_it
        ? project.shortDescription_it
        : project.shortDescription,
    image: project.image,
    tags: project.tags,
    markdown:
      locale === "it" && project.markdown_it ? project.markdown_it : project.markdown,
    github: project.github ?? null,
    demo: project.demo ?? null,
    features:
      locale === "it" && project.features_it ? project.features_it : project.features,
    featured: project.featured,
  };
}

function getFallbackProjects(locale: Locale = defaultLocale): Project[] {
  return fallbackProjectsRaw.map((project) => mapFallbackProject(project, locale));
}

function mapRow(row: DbProjectRow, locale: Locale = defaultLocale): Project {
  const fallback = fallbackProjectsRaw.find((project) => project.id === row.id);
  const fallbackHasItalian = Boolean(
    fallback?.shortDescription_it || fallback?.features_it || fallback?.markdown_it
  );
  const hasItalianTranslation = Boolean(
    row.short_description_it || row.markdown_it || row.features_it
  );
  const shouldUseFallbackItalian = locale === "it" && !hasItalianTranslation && fallbackHasItalian;

  return {
    id: row.id,
    title: row.title,
    shortDescription:
      locale === "it"
        ? row.short_description_it ?? fallback?.shortDescription_it ?? row.short_description
        : row.short_description,
    image: `/api/projects/${row.id}/image`,
    tags: row.tags ?? [],
    markdown:
      locale === "it"
        ? row.markdown_it ?? fallback?.markdown_it ?? row.markdown
        : row.markdown,
    github: row.github,
    demo: row.demo,
    features:
      locale === "it" ? row.features_it ?? fallback?.features_it ?? row.features : row.features,
    hasItalianTranslation: hasItalianTranslation || shouldUseFallbackItalian,
  };
}

export async function fetchProjects(locale: Locale = defaultLocale): Promise<Project[]> {
  if (!isDbEnabled) return getFallbackProjects(locale);

  const sql = getDbClient();
  if (!sql) return getFallbackProjects(locale);

  try {
    const rows = (await sql`
      select id, title, short_description, short_description_it, image, tags, markdown, markdown_it, github, demo, features, features_it
      from projects
      order by created_at desc
    `) as DbProjectRow[];
    if (!rows?.length) return getFallbackProjects(locale);
    const mapped = rows.map((row) => mapRow(row, locale));
    return mapped;
  } catch (error) {
    console.error("Failed to load projects from Neon, falling back to JSON", error);
    return getFallbackProjects(locale);
  }
}

export async function fetchProjectById(
  id: string,
  locale: Locale = defaultLocale
): Promise<Project | undefined> {
  if (!id) return undefined;

  if (!isDbEnabled) {
    return getFallbackProjects(locale).find((p) => p.id === id);
  }

  const sql = getDbClient();
  if (!sql) return getFallbackProjects(locale).find((p) => p.id === id);

  try {
    const rows = (await sql`
      select id, title, short_description, short_description_it, image, tags, markdown, markdown_it, github, demo, features, features_it
      from projects
      where id = ${id}
      limit 1
    `) as DbProjectRow[];
    const row = rows?.[0];
    if (!row) return getFallbackProjects(locale).find((p) => p.id === id);
    return mapRow(row, locale);
  } catch (error) {
    console.error("Failed to load project from Neon, falling back to JSON", error);
    return getFallbackProjects(locale).find((p) => p.id === id);
  }
}
