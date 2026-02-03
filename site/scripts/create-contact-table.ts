import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

async function createContactTable() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL not found in environment variables");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  try {
    console.log("Creating contact_requests table...");

    await sql`
      CREATE TABLE IF NOT EXISTS contact_requests (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        ip_address TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    console.log("✓ contact_requests table created successfully");

    await sql`
      CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at 
      ON contact_requests(created_at DESC)
    `;

    console.log("✓ Index created successfully");
    console.log("\nDone! Contact form is ready to accept submissions.");
  } catch (error) {
    console.error("Error creating contact_requests table:", error);
    process.exit(1);
  }
}

createContactTable();
