import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import fs from "fs/promises";
import path from "path";
import { readImageFile } from "@/lib/image-data";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing. Set it in .env.local or environment vars.");
  process.exit(1);
}

const sql = neon(connectionString);

interface ProjectMetadata {
  id: string;
  title: string;
  shortDescription: string;
  shortDescriptionIt?: string;
  image: string;
  tags: string[];
  github?: string;
  demo?: string;
  features?: string[];
  featuresIt?: string[];
  featured?: boolean;
}

async function publishProject(projectId: string) {
  console.log(`\n📦 Publishing project: ${projectId}\n`);

  const contentDir = path.join(process.cwd(), "content", "projects");
  const assetsDir = path.join(process.cwd(), "content", "project-assets", projectId);

  // 1. Read markdown files
  console.log("📄 Reading markdown files...");
  const markdownEn = await fs.readFile(
    path.join(contentDir, `${projectId}.en.md`),
    "utf-8"
  );
  let markdownIt: string | null = null;
  try {
    markdownIt = await fs.readFile(
      path.join(contentDir, `${projectId}.it.md`),
      "utf-8"
    );
  } catch {
    console.log("  ⚠️  No Italian markdown found, skipping");
  }

  // 2. Read metadata file (optional)
  let metadata: Partial<ProjectMetadata> = {};
  try {
    const metadataPath = path.join(contentDir, `${projectId}.meta.json`);
    const metadataContent = await fs.readFile(metadataPath, "utf-8");
    metadata = JSON.parse(metadataContent);
    console.log("📋 Metadata loaded from .meta.json");
  } catch {
    console.log("  ℹ️  No metadata file found, using defaults");
  }

  // 3. Check if project exists
  const existing = await sql`
    select id from projects where id = ${projectId} limit 1
  `;

  if (!existing || existing.length === 0) {
    console.error(`❌ Project ${projectId} not found in DB. Run 'npm run seed' first or create it manually.`);
    process.exit(1);
  }

  // 4. Update markdown in DB
  console.log("💾 Updating markdown in database...");
  await sql`
    update projects
    set 
      markdown = ${markdownEn},
      markdown_it = ${markdownIt},
      short_description_it = ${metadata.shortDescriptionIt || null},
      features_it = ${metadata.featuresIt || null}
    where id = ${projectId}
  `;
  console.log("  ✓ Markdown updated");

  // 5. Upload assets (images)
  console.log("🖼️  Uploading assets...");
  try {
    const assetFiles = await fs.readdir(assetsDir);
    let uploadedCount = 0;

    for (const file of assetFiles) {
      const filePath = path.join(assetsDir, file);
      const stats = await fs.stat(filePath);

      if (!stats.isFile()) continue;

      // Determine locale from filename (e.g., pipeline.en.png, pipeline.it.png, or pipeline.png)
      let locale: string | null = null;
      let slug = file;
      const localeMatch = file.match(/\.([a-z]{2})\.(png|jpg|jpeg|gif|svg|webp)$/i);
      if (localeMatch) {
        locale = localeMatch[1];
        slug = file.replace(`.${locale}.`, ".");
      }

      const { buffer, mimeType } = await readImageFile(filePath);
      const assetId = `${projectId}-${slug}${locale ? `-${locale}` : ""}`;

      // Delete existing asset with same id
      await sql`delete from project_assets where id = ${assetId}`;

      // Insert new asset
      await sql`
        insert into project_assets (id, project_id, locale, slug, mime_type, blob)
        values (
          ${assetId},
          ${projectId},
          ${locale},
          ${slug},
          ${mimeType},
          ${buffer}
        )
      `;

      console.log(`  ✓ ${file} (${locale || "default"})`);
      uploadedCount++;
    }

    console.log(`\n✅ Published ${uploadedCount} assets`);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.log("  ℹ️  No assets directory found, skipping");
    } else {
      throw error;
    }
  }

  console.log(`\n🎉 Project '${projectId}' published successfully!\n`);
  console.log("📝 In your markdown, reference images like:");
  console.log(`   ![Description](/api/assets/${projectId}/image.png)`);
  console.log(`   ![Description](/api/assets/${projectId}/image.png?locale=it) (for IT-specific)`);
}

const projectId = process.argv[2];

if (!projectId) {
  console.error("Usage: npm run publish <project-id>");
  console.error("Example: npm run publish basket-ai");
  process.exit(1);
}

publishProject(projectId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Publish failed:", error);
    process.exit(1);
  });
