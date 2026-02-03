import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import fs from "fs/promises";
import path from "path";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing. Set it in .env.local or environment vars.");
  process.exit(1);
}

const sql = neon(connectionString);

const CONTENT_DIR = path.join(process.cwd(), "content", "projects");

interface MarkdownFiles {
  en?: string;
  it?: string;
}

async function getProjectMarkdownFiles(): Promise<Record<string, MarkdownFiles>> {
  const files = await fs.readdir(CONTENT_DIR);
  const projectFiles: Record<string, MarkdownFiles> = {};

  for (const file of files) {
    const match = file.match(/^(.+)\.(en|it)\.md$/);
    if (match) {
      const [, projectId, locale] = match;
      if (!projectFiles[projectId]) {
        projectFiles[projectId] = {};
      }
      const content = await fs.readFile(path.join(CONTENT_DIR, file), "utf-8");
      projectFiles[projectId][locale as "en" | "it"] = content;
    }
  }

  return projectFiles;
}

async function syncMarkdown() {
  console.log("Reading markdown files from content/projects...");
  const projectFiles = await getProjectMarkdownFiles();

  console.log(`Found ${Object.keys(projectFiles).length} projects with markdown files.`);

  for (const [projectId, files] of Object.entries(projectFiles)) {
    console.log(`\nSyncing project: ${projectId}`);
    
    // Check if project exists in DB
    const existing = await sql`
      select id from projects where id = ${projectId} limit 1
    `;

    if (!existing || existing.length === 0) {
      console.warn(`  ⚠️  Project ${projectId} not found in DB. Skipping.`);
      continue;
    }

    // Update markdown fields
    await sql`
      update projects
      set 
        markdown = ${files.en || null},
        markdown_it = ${files.it || null}
      where id = ${projectId}
    `;

    console.log(`  ✓ Updated markdown (EN: ${files.en ? "✓" : "✗"}, IT: ${files.it ? "✓" : "✗"})`);
  }

  console.log("\n✅ Markdown sync complete!");
}

syncMarkdown()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Sync failed:", error);
    process.exit(1);
  });
