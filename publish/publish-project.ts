import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLISH_ROOT = __dirname;
const SITE_ROOT = path.resolve(PUBLISH_ROOT, "../site");
const CONTENT_ROOT = path.join(PUBLISH_ROOT, "content", "projects");

config({ path: path.join(SITE_ROOT, ".env.local") });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing. Set it in site/.env.local before publishing.");
  process.exit(1);
}

const sql = neon(connectionString);

interface ProjectMetadata {
  shortDescriptionIt?: string;
  featuresIt?: string[];
}

const MIME_MAP: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function slugAndLocaleFromFilename(fileName: string) {
  const localeMatch = fileName.match(/^(.*)\.([a-z]{2})\.(png|jpg|jpeg|gif|svg|webp|mp4|webm)$/i);
  if (localeMatch) {
    const baseName = localeMatch[1];
    const locale = localeMatch[2];
    const ext = localeMatch[3];
    return { slug: `${baseName}.${ext}`, locale };
  }
  return { slug: fileName, locale: null as string | null };
}

async function readAssetFile(filePath: string) {
  const buffer = await fs.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_MAP[ext] ?? "application/octet-stream";
  return { buffer, mimeType };
}

export async function publishProject(projectId: string) {
  console.log(`\n📦 Publishing project: ${projectId}`);
  const projectDir = path.join(CONTENT_ROOT, projectId);

  try {
    await fs.access(projectDir);
  } catch {
    throw new Error(`Project directory not found: ${projectDir}`);
  }

  const markdownEnPath = path.join(projectDir, "en.md");
  const markdownItPath = path.join(projectDir, "it.md");
  const metaPath = path.join(projectDir, "meta.json");
  const assetsDir = path.join(projectDir, "assets");

  const markdownEn = await fs.readFile(markdownEnPath, "utf-8");
  let markdownIt: string | null = null;
  try {
    markdownIt = await fs.readFile(markdownItPath, "utf-8");
  } catch {
    console.log("  ℹ️  No it.md found, skipping Italian markdown");
  }

  let metadata: ProjectMetadata = {};
  try {
    const metaRaw = await fs.readFile(metaPath, "utf-8");
    metadata = JSON.parse(metaRaw);
    console.log("  📋 Loaded meta.json");
  } catch {
    console.log("  ℹ️  No meta.json found, using defaults");
  }

  const existing = await sql`
    select id from projects where id = ${projectId} limit 1
  `;

  if (!existing || existing.length === 0) {
    throw new Error(`Project '${projectId}' not found in DB. Seed it first.`);
  }

  await sql`
    update projects
    set
      markdown = ${markdownEn},
      markdown_it = ${markdownIt},
      short_description_it = ${metadata.shortDescriptionIt || null},
      features_it = ${metadata.featuresIt || null}
    where id = ${projectId}
  `;
  console.log("  ✅ Markdown + metadata updated");

  try {
    const assetEntries = await fs.readdir(assetsDir, { withFileTypes: true });
    let uploadedCount = 0;

    for (const entry of assetEntries) {
      if (!entry.isFile()) continue;
      const assetPath = path.join(assetsDir, entry.name);
      const { slug, locale } = slugAndLocaleFromFilename(entry.name);
      const { buffer, mimeType } = await readAssetFile(assetPath);
      const assetId = `${projectId}-${slug}${locale ? `-${locale}` : ""}`;

      await sql`delete from project_assets where id = ${assetId}`;
      await sql`
        insert into project_assets (id, project_id, locale, slug, mime_type, blob)
        values (${assetId}, ${projectId}, ${locale}, ${slug}, ${mimeType}, ${buffer})
      `;
      console.log(`  🖼️  Uploaded ${entry.name}${locale ? ` (${locale})` : ""}`);
      uploadedCount++;
    }

    console.log(`  ✅ Uploaded ${uploadedCount} assets`);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log("  ℹ️  No assets directory found, skipping asset upload");
    } else {
      throw error;
    }
  }

  console.log(`🎉 Finished publishing '${projectId}'`);
}

const invokedPath = path.resolve(process.argv[1] ?? "");
const isCli = invokedPath === fileURLToPath(import.meta.url);

if (isCli) {
  const projectId = process.argv[2];
  if (!projectId) {
    console.error("Usage: npm run publish <project-id>");
    process.exit(1);
  }

  publishProject(projectId)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Publish failed", error);
      process.exit(1);
    });
}
