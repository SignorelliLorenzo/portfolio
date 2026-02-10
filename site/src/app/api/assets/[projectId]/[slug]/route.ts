import { NextRequest, NextResponse } from "next/server";

// Legacy route — assets are now served as static files from /projects/<id>/assets/
// This redirect keeps old /api/assets/<projectId>/<slug> URLs working.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; slug: string }> }
) {
  const { projectId, slug } = await params;
  const staticUrl = `/projects/${projectId}/assets/${slug}`;
  return NextResponse.redirect(new URL(staticUrl, request.url), 301);
}
