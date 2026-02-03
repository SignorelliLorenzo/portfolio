import { neon } from "@neondatabase/serverless";

// Returns a Neon client when DATABASE_URL is present; otherwise null for graceful fallback
export function getDbClient() {
  if (!process.env.DATABASE_URL) return null;
  return neon(process.env.DATABASE_URL);
}

export const isDbEnabled = Boolean(process.env.DATABASE_URL);
