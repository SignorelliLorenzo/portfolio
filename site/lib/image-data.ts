import fs from "fs/promises";
import path from "path";

const mimeMap: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const cache = new Map<string, string>();

function isExternal(imagePath: string) {
  return imagePath.startsWith("data:") || imagePath.startsWith("http://") || imagePath.startsWith("https://");
}

function normalizePath(imagePath: string) {
  return imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
}

export async function readImageFile(imagePath: string | undefined | null) {
  if (!imagePath) {
    throw new Error("readImageFile: imagePath is required");
  }
  if (isExternal(imagePath)) {
    throw new Error("readImageFile: external URLs are not supported for file reads");
  }

  const relativePath = normalizePath(imagePath);
  const absolutePath = path.join(process.cwd(), "public", relativePath);
  const buffer = await fs.readFile(absolutePath);
  const ext = path.extname(relativePath).toLowerCase();
  const mimeType = mimeMap[ext] ?? "application/octet-stream";

  return { buffer, mimeType, absolutePath };
}

export async function resolveImageData(imagePath: string | undefined | null): Promise<string> {
  if (!imagePath) return "";
  if (isExternal(imagePath)) return imagePath;

  if (cache.has(imagePath)) {
    return cache.get(imagePath)!;
  }

  try {
    const { buffer, mimeType } = await readImageFile(imagePath);
    const dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    cache.set(imagePath, dataUrl);
    return dataUrl;
  } catch (error) {
    console.warn(`resolveImageData: unable to read ${imagePath}`, error);
    return imagePath;
  }
}

export async function resolveImageDataForProjects<T extends { image: string }>(projects: T[]): Promise<T[]> {
  return Promise.all(
    projects.map(async (project) => ({
      ...project,
      image: await resolveImageData(project.image),
    }))
  );
}
