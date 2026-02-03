import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import projectsJson from "../site/data/projects.json";
import { readImageFile } from "../site/lib/image-data";
import { Project } from "../site/lib/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SITE_ROOT = path.resolve(__dirname, "../site");
const siteRequire = createRequire(path.join(SITE_ROOT, "package.json"));

const { config } = siteRequire("dotenv") as typeof import("dotenv");
const { neon } = siteRequire("@neondatabase/serverless") as typeof import("@neondatabase/serverless");

config({ path: path.join(SITE_ROOT, ".env.local") });
process.chdir(SITE_ROOT);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing. Set it in site/.env.local or environment vars before seeding.");
  process.exit(1);
}

const sql = neon(connectionString);
const projects = projectsJson as Project[];

async function seed() {
  console.log("Creating projects table if it doesn't exist...");
  await sql`
    create table if not exists projects (
      id text primary key,
      title text not null,
      short_description text not null,
      image text not null,
      image_mime text,
      image_blob bytea,
      tags text[] default '{}',
      markdown text,
      github text,
      demo text,
      features text[],
      featured boolean default false,
      created_at timestamptz default now()
    )
  `;

  await sql`alter table projects add column if not exists image_mime text`;
  await sql`alter table projects add column if not exists image_blob bytea`;
  await sql`alter table projects add column if not exists featured boolean default false`;
  await sql`alter table projects add column if not exists short_description_it text`;
  await sql`alter table projects add column if not exists markdown_it text`;
  await sql`alter table projects add column if not exists features_it text[]`;

  console.log(`Upserting ${projects.length} projects...`);
  for (const project of projects) {
    const { buffer, mimeType } = await readImageFile(project.image);
    await sql`
      insert into projects (id, title, short_description, image, image_mime, image_blob, tags, markdown, github, demo, features, featured)
      values (
        ${project.id},
        ${project.title},
        ${project.shortDescription},
        ${project.image},
        ${mimeType},
        ${buffer},
        ${project.tags || []},
        ${project.markdown ?? null},
        ${project.github ?? null},
        ${project.demo ?? null},
        ${project.features ?? null},
        ${project.featured ?? false}
      )
      on conflict (id) do update set
        title = excluded.title,
        short_description = excluded.short_description,
        image = excluded.image,
        image_mime = excluded.image_mime,
        image_blob = excluded.image_blob,
        tags = excluded.tags,
        markdown = excluded.markdown,
        github = excluded.github,
        demo = excluded.demo,
        features = excluded.features,
        featured = excluded.featured;
    `;
    console.log(`✓ ${project.title}`);
  }

  console.log("Seeding complete!");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  });
