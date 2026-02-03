import { NextResponse } from "next/server";
import { getDbClient, isDbEnabled } from "@/lib/db";
import projectsJson from "@/data/projects.json";
import { readImageFile } from "@/lib/image-data";

export const runtime = "nodejs";

type ImageRow = {
  image_blob: Uint8Array | Buffer | string | null;
  image_mime: string | null;
};

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

function createImageResponse(bytes: Uint8Array, mimeType: string) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Response(copy.buffer, {
    status: 200,
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing project id" }, { status: 400 });
  }

  try {
    if (isDbEnabled) {
      const sql = getDbClient();
      if (sql) {
        const rows = (await sql`
          select image_blob, image_mime
          from projects
          where id = ${id}
          limit 1
        `) as ImageRow[];
        const row = rows?.[0];
        if (row) {
          const bytes = normalizeBytes(row.image_blob);
          if (bytes && row.image_mime) {
            return createImageResponse(bytes, row.image_mime);
          }
        }
      }
    }

    // Fallback to reading from static files if DB is disabled or missing data
    const project = (projectsJson as { id: string; image: string }[]).find((p) => p.id === id);
    if (!project?.image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const { buffer, mimeType } = await readImageFile(project.image);
    return createImageResponse(buffer, mimeType);
  } catch (error) {
    console.error("project image handler failed", error);
    return NextResponse.json({ error: "Unable to load image" }, { status: 500 });
  }
}
