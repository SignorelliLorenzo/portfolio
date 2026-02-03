import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

const connectionString = process.env.DATABASE_URL;

interface AssetRow {
  blob: Uint8Array | Buffer | string | null;
  mime_type: string;
}

function normalizeBytes(value: Uint8Array | Buffer | string | null | undefined): Uint8Array | null {
  if (!value) return null;
  if (value instanceof Uint8Array) return value;
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(value)) {
    return new Uint8Array(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
  }
  if (typeof value === "string") {
    const hex = value.startsWith("\\x") ? value.slice(2) : value;
    const buf = Buffer.from(hex, "hex");
    return new Uint8Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; slug: string }> }
) {
  const { projectId, slug } = await params;

  if (!connectionString) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  const sql = neon(connectionString);

  try {
    const locale = request.nextUrl.searchParams.get("locale");

    const rows = (await sql`
      select blob, mime_type
      from project_assets
      where project_id = ${projectId}
        and slug = ${slug}
        and (locale = ${locale} or locale is null)
      order by locale desc nulls last
      limit 1
    `) as AssetRow[];

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const asset = rows[0];
    const buffer = normalizeBytes(asset.blob);

    if (!buffer) {
      return NextResponse.json({ error: "Asset has no binary data" }, { status: 404 });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": asset.mime_type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Failed to fetch asset:", error);
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 });
  }
}
