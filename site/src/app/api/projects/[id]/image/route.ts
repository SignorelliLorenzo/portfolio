import { NextResponse } from "next/server";
import { fetchProjectById } from "@/lib/projects";

// Legacy route — project images are now served from /projects/<id>/assets/
// This redirect keeps old URLs working.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing project id" }, { status: 400 });
  }

  const project = await fetchProjectById(id);
  if (project?.image) {
    return NextResponse.redirect(new URL(project.image, _request.url), 301);
  }

  return NextResponse.json({ error: "Image not found" }, { status: 404 });
}
