import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing. Set it in .env.local or environment vars.");
  process.exit(1);
}

const sql = neon(connectionString);

async function createAssetsTable() {
  console.log("Creating project_assets table...");

  await sql`
    create table if not exists project_assets (
      id text primary key,
      project_id text not null,
      locale text,
      slug text not null,
      mime_type text not null,
      blob bytea not null,
      created_at timestamptz default now(),
      constraint fk_project foreign key (project_id) references projects(id) on delete cascade
    )
  `;

  await sql`
    create index if not exists idx_project_assets_lookup 
    on project_assets(project_id, slug, locale)
  `;

  console.log("✅ project_assets table created successfully!");
}

createAssetsTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to create assets table:", error);
    process.exit(1);
  });
